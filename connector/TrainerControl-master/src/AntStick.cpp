/**
 *  AntStick -- communicate with an ANT+ USB stick
 *  Copyright (C) 2017, 2018 Alex Harsanyi <AlexHarsanyi@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify it
 *  under the terms of the GNU General Public License as published by the Free
 *  Software Foundation, either version 3 of the License, or (at your option)
 *  any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
#include "stdafx.h"
#include "AntStick.h"
#include "Tools.h"

#include <iostream>
#include <algorithm>
#include <iterator>
#include <assert.h>

#include <chrono>

#include "winsock2.h" // for struct timeval

#ifdef WIN32
#pragma comment (lib, "libusb-1.0.lib")
#endif

/** IMPLEMENTATION NOTE
 *
 * The ANT Message Protocol implemented here is documented in the "ANT Message
 * Protocol And Usage" document available from https://www.thisisant.com/
 *
 * D00000652_ANT_Message_Protocol_and_Usage_Rev_5.1.pdf
 *
 * Also see the "ANT+ Common Pages" document from the same place.
 *
 * D00001198_-_ANT+_Common_Data_Pages_Rev_3.1
 */

// When this is defined, some debug info is printed to std::cerr
// #define DEBUG_OUTPUT 1

namespace {

enum ChannelType {
    BIDIRECTIONAL_RECEIVE = 0x00,
    BIDIRECTIONAL_TRANSMIT = 0x10,

    SHARED_BIDIRECTIONAL_RECEIVE = 0x20,
    SHARED_BIDIRECTIONAL_TRANSMIT = 0x30,

    UNIDIRECTIONAL_RECEIVE_ONLY = 0x40,
    UNIDIRECTIONAL_TRANSMIT_ONLY = 0x50
};

void CheckChannelResponse (
    const Buffer &response, uint8_t channel, uint8_t cmd, uint8_t status)
{
    if (response.size() < 5)
    {
        if (! std::uncaught_exception())
            throw std::runtime_error ("CheckChannelResponse: short response");
    }
    else if (response[2] != CHANNEL_RESPONSE
        || response[3] != channel
        || response[4] != cmd
        || response[5] != status)
    {
#if defined DEBUG_OUTPUT
        DumpData(&response[0], response.size(), std::cerr);
        std::cerr << "expecting channel: " << (int)channel
                  << ", cmd  " << (int)cmd << ", status " << (int)status << "\n";
#endif
        // Funny thing: this function is also called from a destructor while
        // an exception is being unwound.  Don't cause further trouble...
        if (! std::uncaught_exception())
            throw std::runtime_error ("CheckChannelResponse: bad response");
    }
}

void AddMessageChecksum (Buffer &b)
{
    uint8_t c = 0;
    std::for_each (b.begin(), b.end(), [&](uint8_t e) { c ^= e; });
    b.push_back (c);
}

bool IsGoodChecksum (const Buffer &message)
{
    uint8_t c = 0;
    std::for_each (message.begin(), message.end(), [&](uint8_t e) { c ^= e; });
    return c == 0;
}

Buffer MakeMessage (AntMessageId id, uint8_t data)
{
    Buffer b;
    b.push_back (SYNC_BYTE);
    b.push_back (0x01);                 // data length
    b.push_back (static_cast<uint8_t>(id));
    b.push_back (data);
    AddMessageChecksum (b);
    return b;
}

Buffer MakeMessage (AntMessageId id, uint8_t data0, uint8_t data1)
{
    Buffer b;
    b.push_back (SYNC_BYTE);
    b.push_back (0x02);                 // data length
    b.push_back (static_cast<uint8_t>(id));
    b.push_back (data0);
    b.push_back (data1);
    AddMessageChecksum (b);
    return b;
}

Buffer MakeMessage (AntMessageId id,
                    uint8_t data0, uint8_t data1, uint8_t data2)
{
    Buffer b;
    b.push_back (SYNC_BYTE);
    b.push_back (0x03);                 // data length
    b.push_back (static_cast<uint8_t>(id));
    b.push_back (data0);
    b.push_back (data1);
    b.push_back (data2);
    AddMessageChecksum (b);
    return b;
}

Buffer MakeMessage (AntMessageId id,
                    uint8_t data0, uint8_t data1, uint8_t data2,
                    uint8_t data3, uint8_t data4)
{
    Buffer b;
    b.push_back (SYNC_BYTE);
    b.push_back (0x05);                 // data length
    b.push_back (static_cast<uint8_t>(id));
    b.push_back (data0);
    b.push_back (data1);
    b.push_back (data2);
    b.push_back (data3);
    b.push_back (data4);
    AddMessageChecksum (b);
    return b;
}

Buffer MakeMessage (AntMessageId id, Buffer data)
{
    Buffer b;
    b.push_back (SYNC_BYTE);
    b.push_back (static_cast<uint8_t>(data.size()));
    b.push_back (static_cast<uint8_t>(id));
    b.insert (b.end(), data.begin(), data.end());
    AddMessageChecksum (b);
    return b;
}

Buffer MakeMessage (AntMessageId id, uint8_t data0, const Buffer &data)
{
    Buffer b;
    b.push_back (SYNC_BYTE);
    b.push_back (static_cast<uint8_t>(data.size() + 1));
    b.push_back (static_cast<uint8_t>(id));
    b.push_back (data0);
    b.insert (b.end(), data.begin(), data.end());
    AddMessageChecksum (b);
    return b;
}

Buffer MakeMessage (AntMessageId id, uint8_t data0, uint8_t data1, const Buffer &data)
{
    Buffer b;
    b.push_back (SYNC_BYTE);
    b.push_back (static_cast<uint8_t>(data.size() + 2));
    b.push_back (static_cast<uint8_t>(id));
    b.push_back (data0);
    b.push_back(data1);
    b.insert (b.end(), data.begin(), data.end());
    AddMessageChecksum (b);
    return b;
}

struct ChannelEventName {
    AntChannelEvent event;
    const char *text;
} g_ChanelEventNames[] = {
    { RESPONSE_NO_ERROR, "no error" },
    { EVENT_RX_SEARCH_TIMEOUT, "channel search timeout" },
    { EVENT_RX_FAIL, "rx fail" },
    { EVENT_TX, "broadcast tx complete" },
    { EVENT_TRANSFER_RX_FAILED, "rx transfer fail" },
    { EVENT_TRANSFER_TX_COMPLETED, "tx complete" },
    { EVENT_TRANSFER_TX_FAILED, "tx fail" },
    { EVENT_CHANNEL_CLOSED, "channel closed" },
    { EVENT_RX_FAIL_GO_TO_SEARCH, "dropped to search mode" },
    { EVENT_CHANNEL_COLLISION, "channel collision" },
    { EVENT_TRANSFER_TX_START, "burst transfer start" },
    { EVENT_TRANSFER_NEXT_DATA_BLOCK, "burst next data block" },
    { CHANNEL_IN_WRONG_STATE, "channel in wrong state" },
    { CHANNEL_NOT_OPENED, "channel not opened" },
    { CHANNEL_ID_NOT_SET, "channel id not set" },
    { CLOSE_ALL_CHANNELS, "all channels closed" },
    { TRANSFER_IN_PROGRESS, "transfer in progress" },
    { TRANSFER_SEQUENCE_NUMBER_ERROR, "transfer sequence error" },
    { TRANSFER_IN_ERROR, "burst transfer error" },
    { MESSAGE_SIZE_EXCEEDS_LIMIT, "message too big" },
    { INVALID_MESSAGE, "invalid message" },
    { INVALID_NETWORK_NUMBER, "invalid network number" },
    { INVALID_LIST_ID, "invalid list id" },
    { INVALID_SCAN_TX_CHANNEL, "attempt to transmit in ANT channel 0 in scan mode" },
    { INVALID_PARAMETER_PROVIDED, "invalid parameter" },
    { EVENT_SERIAL_QUE_OVERFLOW, "output serial overflow" },
    { EVENT_QUE_OVERFLOW, "input serial overflow" },
    { ENCRYPT_NEGOTIATION_SUCCESS, "encrypt negotiation success" },
    { ENCRYPT_NEGOTIATION_FAIL, "encrypt negotiation fail" },
    { NVM_FULL_ERROR, "nvm full" },
    { NVM_WRITE_ERROR, "nvm write fail" },
    { USB_STRING_WRITE_FAIL, "usb write fail" },
    { MESG_SERIAL_ERROR_ID, "bad usb packet received" },
    { LAST_EVENT_ID, nullptr}};

std::ostream& operator<< (std::ostream &out, const AntChannel::Id &id)
{
    out << "#<ID Type = " << (int)id.DeviceType << "; Number = " << id.DeviceNumber << ">";
    return out;
}

};                                      // end anonymous namespace

const char *ChannelEventAsString(AntChannelEvent e)
{
    for (int i = 0; g_ChanelEventNames[i].event != LAST_EVENT_ID; i++) {
        if (g_ChanelEventNames[i].event == e)
            return g_ChanelEventNames[i].text;
    }
    return "unknown channel event";
}


// ................................................... AntMessageReader ....

/** Read ANT messages from an USB device (the ANT stick) */
class AntMessageReader
{
public:
    AntMessageReader (libusb_device_handle *dh, uint8_t endpoint);
    ~AntMessageReader();

    void MaybeGetNextMessage(Buffer &message);
    void GetNextMessage (Buffer &message);

private:

    void GetNextMessage1(Buffer &message);

    static void LIBUSB_CALL Trampoline (libusb_transfer *);
    void SubmitUsbTransfer();
    void CompleteUsbTransfer(const libusb_transfer *);

    libusb_device_handle *m_DeviceHandle;
    uint8_t m_Endpoint;
    libusb_transfer *m_Transfer;

    /** Hold partial data received from the USB stick.  A single USB read
     * might not return an entire ANT message. */
    Buffer m_Buffer;
    unsigned m_Mark;            // buffer position up to where data is available
    bool m_Active;              // is there a transfer active?
};


AntMessageReader::AntMessageReader (libusb_device_handle *dh, uint8_t endpoint)
    : m_DeviceHandle (dh),
      m_Endpoint (endpoint),
      m_Transfer (nullptr),
      m_Mark(0),
      m_Active (false)
{
    m_Buffer.reserve (1024);
    m_Transfer = libusb_alloc_transfer (0);
}

AntMessageReader::~AntMessageReader()
{
    if (m_Active) {
        libusb_cancel_transfer (m_Transfer);
    }
    while (m_Active) {
        libusb_handle_events(nullptr);
    }
    libusb_free_transfer (m_Transfer);
}

/** Fill `message' with the next available message.  If no message is received
 * within a small amount of time, an empty buffer is returned.  If a message
 * is returned, it is a valid message (good header, length and checksum).
 */
void AntMessageReader::MaybeGetNextMessage (Buffer &message)
{
    message.clear();

    if (m_Active) {
        struct timeval tv;
        tv.tv_sec = 0;
        tv.tv_usec = 10 * 1000;
        int r = libusb_handle_events_timeout_completed (nullptr, &tv, nullptr);
        if (r < 0)
            throw LibusbError ("libusb_handle_events_timeout_completed", r);
    }

    if(! m_Active) {
        // a transfer was completed, see if we have a full message.
        GetNextMessage1(message);
    }
}


/** Fill `message' with the next available message.  If a message is returned,
 * it is a valid message (good header, length and checksum).  If no message is
 * received within a small amount of time, a timeout exception will be
 * thrown.
 */
void AntMessageReader::GetNextMessage(Buffer &message)
{
    MaybeGetNextMessage(message);
    int tries = 100;
    while (message.empty() && tries > 0)
    {
        MaybeGetNextMessage(message);
        tries--;
    }
    if (message.empty())
        throw std::runtime_error ("AntMessageReader::GetNextMessage: timed out");
}

void AntMessageReader::GetNextMessage1(Buffer &message)
{
    // Cannot operate on the buffer while a transfer is active
    assert (! m_Active);

    // In case the CompleteUsbTransfer was not called...
    m_Buffer.erase(m_Buffer.begin() + m_Mark, m_Buffer.end());

    // Look for the sync byte which starts a message
    while ((! m_Buffer.empty()) && m_Buffer[0] != SYNC_BYTE) {
        m_Buffer.erase(m_Buffer.begin());
        m_Mark--;
    }

    // An ANT message has the following sequence: SYNC, LEN, MSGID, DATA,
    // CHECKSUM.  An empty message has at least 4 bytes in it.
    if (m_Mark < 4) {
        SubmitUsbTransfer();
        return MaybeGetNextMessage(message);
    }

    // LEN is the length of the data, actual message length is LEN + 4.
    unsigned len = m_Buffer[1] + 4;

    if (m_Mark < len) {
        SubmitUsbTransfer();
        return MaybeGetNextMessage(message);
    }

    std::copy(m_Buffer.begin(), m_Buffer.begin() + len, std::back_inserter(message));
    // Remove the message from the buffer.
    m_Buffer.erase (m_Buffer.begin(), m_Buffer.begin() + len);
    m_Mark -= len;

    if (! IsGoodChecksum (message))
        throw std::runtime_error ("AntMessageReader::GetNextMessage1: bad checksum");
}

void LIBUSB_CALL AntMessageReader::Trampoline (libusb_transfer *t)
{
    AntMessageReader *a = reinterpret_cast<AntMessageReader*>(t->user_data);
    a->CompleteUsbTransfer (t);
}

void AntMessageReader::SubmitUsbTransfer()
{
    assert (! m_Active);

    const int read_size = 128;
    const int timeout = 10000;

    // Make sure we have enough space in the buffer.
    m_Buffer.resize (m_Mark + read_size);

    libusb_fill_bulk_transfer (
        m_Transfer, m_DeviceHandle, m_Endpoint,
        &m_Buffer[m_Mark], read_size, Trampoline, this, timeout);

    int r = libusb_submit_transfer (m_Transfer);
    if (r < 0)
        throw LibusbError ("libusb_submit_transfer", r);

    m_Active = true;
}

void AntMessageReader::CompleteUsbTransfer(const libusb_transfer *t)
{
    assert(t == m_Transfer);

    m_Active = false;

    if (m_Transfer->status == LIBUSB_TRANSFER_COMPLETED) {
        m_Mark += m_Transfer->actual_length;
    }

    m_Buffer.erase(m_Buffer.begin() + m_Mark, m_Buffer.end());
}



// ................................................... AntMessageWriter ....

/** Write ANT messages to a USB device (the ANT stick). */
class AntMessageWriter
{
public:
    AntMessageWriter (libusb_device_handle *dh, uint8_t endpoint);
    ~AntMessageWriter();

    void WriteMessage (const Buffer &message);

private:

    static void LIBUSB_CALL Trampoline (libusb_transfer *);
    void SubmitUsbTransfer(const Buffer &message, int timeout);
    void CompleteUsbTransfer(const libusb_transfer *);
    void WaitForCompletion(int timeout);

    libusb_device_handle *m_DeviceHandle;
    uint8_t m_Endpoint;
    libusb_transfer *m_Transfer;

    Buffer m_Buffer;
    bool m_Active;                      // is there a transfer active?
};


AntMessageWriter::AntMessageWriter (libusb_device_handle *dh, uint8_t endpoint)
    : m_DeviceHandle (dh), m_Endpoint (endpoint), m_Transfer (nullptr), m_Active (false)
{
    m_Transfer = libusb_alloc_transfer (0);
}

AntMessageWriter::~AntMessageWriter()
{
    if (m_Active) {
        libusb_cancel_transfer (m_Transfer);
    }
    WaitForCompletion(2000);
    libusb_free_transfer (m_Transfer);
}

/** Write `message' to the USB device.  This is presumably an ANT message, but
 * we don't check.  When this function returns, the message has been written
 * (there is no buffering on the application side). An exception is thrown if
 * there is an error or a timeout.
 */
void AntMessageWriter::WriteMessage (const Buffer &message)
{
    assert (! m_Active);
    SubmitUsbTransfer(message, 2000 /* milliseconds */);
    WaitForCompletion(2000 /* milliseconds */);

    if (m_Transfer->status == LIBUSB_TRANSFER_COMPLETED) {
        m_Active = false; // sometimes CompleteUsbTransfer() is not called, not sure why...
    }

    if (m_Active || m_Transfer->status != LIBUSB_TRANSFER_COMPLETED) {
        m_Active = false;
        int r = 0;

        if (m_Transfer->status == LIBUSB_TRANSFER_STALL) {
            r = libusb_clear_halt(m_DeviceHandle, m_Endpoint);
            if (r < 0) {
                throw LibusbError("libusb_clear_halt", r);
            }
        }

        throw LibusbError("AntMessageReader", m_Transfer->status);
    }
}

void LIBUSB_CALL AntMessageWriter::Trampoline (libusb_transfer *t)
{
    AntMessageWriter *a = reinterpret_cast<AntMessageWriter*>(t->user_data);
    a->CompleteUsbTransfer (t);
}

void AntMessageWriter::SubmitUsbTransfer(const Buffer &message, int timeout)
{
    m_Buffer = message;

    libusb_fill_bulk_transfer (
        m_Transfer, m_DeviceHandle, m_Endpoint,
        &m_Buffer[0], m_Buffer.size(), Trampoline, this, timeout);

    int r = libusb_submit_transfer (m_Transfer);
    if (r < 0)
        throw LibusbError ("libusb_submit_transfer", r);

    m_Active = true;
}

void AntMessageWriter::CompleteUsbTransfer(const libusb_transfer *t)
{
    assert (t == m_Transfer);
    m_Active = false;
}

void AntMessageWriter::WaitForCompletion(int timeout)
{
    using namespace std::chrono;

    struct timeval tv;
    tv.tv_sec = timeout / 1000;
    tv.tv_usec = (timeout - tv.tv_sec * 1000) * 1000;
    auto start = high_resolution_clock::now();
    milliseconds accumulated;

    // NOTE: libusb_handle_events and friends will handle all USB events, but
    // not necessarily our event, as such they might return before our
    // transfer is complete.  We wait repeatedly until our event is complete
    // or 'timeout' milliseconds have passed.

    while (m_Active && accumulated.count() < timeout)
    {
        int r = libusb_handle_events_timeout_completed (nullptr, &tv, nullptr);
        if (r < 0)
            throw LibusbError ("libusb_handle_events_timeout_completed", r);
        auto now = high_resolution_clock::now();
        accumulated = duration_cast<milliseconds>(now - start);
    }
}


// ......................................................... AntChannel ....

AntChannel::AntChannel (AntStick *stick,
                        AntChannel::Id channel_id,
                        unsigned period,
                        uint8_t timeout,
                        uint8_t frequency)
    : m_Stick (stick),
      m_IdReqestOutstanding (false),
      m_AckDataRequestOutstanding(false),
      m_ChannelId(channel_id),
      m_MessagesReceived(0),
      m_MessagesFailed(0)
{
    m_ChannelNumber = stick->NextChannelId();

    if (m_ChannelNumber == -1)
        throw std::runtime_error("AntChannel: no more channel ids left");

    // we hard code the type to BIDIRECTIONAL_RECEIVE, using other channel
    // types would require changes to the handling code anyway.
    m_Stick->WriteMessage (
        MakeMessage (
            ASSIGN_CHANNEL, m_ChannelNumber,
            static_cast<uint8_t>(BIDIRECTIONAL_RECEIVE),
            static_cast<uint8_t>(m_Stick->GetNetwork())));
    Buffer response = m_Stick->ReadInternalMessage();
    CheckChannelResponse (response, m_ChannelNumber, ASSIGN_CHANNEL, 0);

    m_Stick->WriteMessage(
        MakeMessage(SET_CHANNEL_ID, m_ChannelNumber,
                    static_cast<uint8_t>(m_ChannelId.DeviceNumber & 0xFF),
                    static_cast<uint8_t>((m_ChannelId.DeviceNumber >> 8) & 0xFF),
                    m_ChannelId.DeviceType,
                    // High nibble of the transmission_type is the top 4 bits
                    // of the 20 bit device id.
                    static_cast<uint8_t>((m_ChannelId.DeviceNumber >> 12) & 0xF0)));
    response = m_Stick->ReadInternalMessage();
    CheckChannelResponse (response, m_ChannelNumber, SET_CHANNEL_ID, 0);

    Configure(period, timeout, frequency);

    m_Stick->WriteMessage (
        MakeMessage (OPEN_CHANNEL, m_ChannelNumber));
    response = m_Stick->ReadInternalMessage();
    CheckChannelResponse (response, m_ChannelNumber, OPEN_CHANNEL, 0);

    m_State = CH_SEARCHING;
    m_Stick->RegisterChannel (this);
}

AntChannel::~AntChannel()
{
    try {
        // The user has not called RequestClose(), try to close the channel
        // now, but this might fail.
        if (m_State != CH_CLOSED) {
            m_Stick->WriteMessage (MakeMessage (CLOSE_CHANNEL, m_ChannelNumber));
            Buffer response = m_Stick->ReadInternalMessage();
            CheckChannelResponse (response, m_ChannelNumber, CLOSE_CHANNEL, 0);

            // The channel has to respond with an EVENT_CHANNEL_CLOSED channel
            // event, but we cannot process that (it would go through
            // Tick(). We wait at least for the event to be generated.
            Sleep(0);

            m_Stick->WriteMessage (MakeMessage (UNASSIGN_CHANNEL, m_ChannelNumber));
            response = m_Stick->ReadInternalMessage();
            CheckChannelResponse (response, m_ChannelNumber, UNASSIGN_CHANNEL, 0);
        }
    }
    catch (std::exception &) {
        // discard it
    }

    m_Stick->UnregisterChannel (this);
}

/** Request this channel to close.  Closing the channel involves receiving a
 * status message back, so HandleMessage() still has to be called with chanel
 * messages until IsOpen() returns false.
 */
void AntChannel::RequestClose()
{
    m_Stick->WriteMessage (MakeMessage (CLOSE_CHANNEL, m_ChannelNumber));
    Buffer response = m_Stick->ReadInternalMessage();
    CheckChannelResponse (response, m_ChannelNumber, CLOSE_CHANNEL, 0);
}

void AntChannel::SendAcknowledgedData(int tag, const Buffer &message)
{
    m_AckDataQueue.push(AckDataItem(tag, message));
}

void AntChannel::RequestDataPage(uint8_t page_id, int transmit_count)
{
    const uint8_t DP_DP_REQUEST = 0x46;

    Buffer msg;
    msg.push_back(DP_DP_REQUEST);
    msg.push_back(0xFF);                // slave serial LSB
    msg.push_back(0xFF);                // slave serial MSB
    msg.push_back(0xFF);                // descriptor 1
    msg.push_back(0xFF);                // descriptor 2
    // number of times we ask the slave to transmit the data page (if it is
    // lost due to channel collisions the slave won't care)
    msg.push_back(transmit_count);
    msg.push_back(page_id);
    msg.push_back(0x01);                // command type: 0x01 request data page
    SendAcknowledgedData(page_id, msg);
}

/** Configure communication parameters for the channel
 */
void AntChannel::Configure (unsigned period, uint8_t timeout, uint8_t frequency)
{
    m_Stick->WriteMessage (
        MakeMessage (SET_CHANNEL_PERIOD, m_ChannelNumber, period & 0xFF, (period >> 8) & 0xff));
    Buffer response = m_Stick->ReadInternalMessage();
    CheckChannelResponse (response, m_ChannelNumber, SET_CHANNEL_PERIOD, 0);

    m_Stick->WriteMessage (
        MakeMessage (SET_CHANNEL_SEARCH_TIMEOUT, m_ChannelNumber, timeout));
    response = m_Stick->ReadInternalMessage();
    CheckChannelResponse (response, m_ChannelNumber, SET_CHANNEL_SEARCH_TIMEOUT, 0);

    m_Stick->WriteMessage (
        MakeMessage (SET_CHANNEL_RF_FREQ, m_ChannelNumber, frequency));
    response = m_Stick->ReadInternalMessage();
    CheckChannelResponse(response, m_ChannelNumber, SET_CHANNEL_RF_FREQ, 0);
}

/** Called by the AntStick::Tick method to process a message received on this
 * channel.  This will look for some channel events, and process them, but
 * delegate most of the messages to ProcessMessage() in the derived class.
 */
void AntChannel::HandleMessage(const uint8_t *data, int size)
{
    if (m_State == CH_CLOSED) {
        // We should not receive messages if we are closed, maybe we should
        // throw?
#if defined DEBUG_OUTPUT
        std::cerr << "AntChannel::HandleMessage -- received a message while closed\n";
        DumpData(data, size, std::cerr);
#endif
        return;
    }

    switch (data[2]) {
    case CHANNEL_RESPONSE:
        OnChannelResponseMessage (data, size);
        break;
    case BROADCAST_DATA:
        if (m_ChannelId.DeviceNumber == 0 && ! m_IdReqestOutstanding)
        {
            // We received a broadcast message on this channel and we don't
            // have a master serial number, find out who is sending us
            // broadcast data
            m_Stick->WriteMessage (
                MakeMessage (REQUEST_MESSAGE, m_ChannelNumber, SET_CHANNEL_ID));
            m_IdReqestOutstanding = true;
        }
        MaybeSendAckData();
        OnMessageReceived(data, size);
        m_MessagesReceived++;
        break;
    case RESPONSE_CHANNEL_ID:
        OnChannelIdMessage (data, size);
        break;
    default:
        OnMessageReceived (data, size);
        break;
    }
}

/** Send an ACKNOWLEDGE_DATA message, if we have one to send and there are no
 * outstanding ones.
 */
void AntChannel::MaybeSendAckData()
{
    if (! m_AckDataRequestOutstanding && ! m_AckDataQueue.empty()) {
        const AckDataItem &item = m_AckDataQueue.front();
        m_Stick->WriteMessage(MakeMessage(ACKNOWLEDGE_DATA, m_ChannelNumber, item.data));
        m_AckDataRequestOutstanding = true;
    }
}

/** Process a channel response message.
 */
void AntChannel::OnChannelResponseMessage (const uint8_t *data, int size)
{
    assert(data[2] == CHANNEL_RESPONSE);

    auto msg_id = data[4];
    auto event = static_cast<AntChannelEvent>(data[5]);
    // msg_id should be 1 if it is a general event and an message ID if it
    // is a response to an channel message we sent previously.  We don't
    // expect chanel responses here
    if (msg_id == 1)
    {
        if (event == EVENT_RX_FAIL)
            m_MessagesFailed++;

        if (event == EVENT_RX_SEARCH_TIMEOUT) {
            // ignore it, we are closed, but we need to wait for the closed
            // message
        }
        else if (event == EVENT_CHANNEL_CLOSED) {
            // NOTE: a search timeout will close the channel.
            if (m_State != CH_CLOSED) {
                ChangeState(CH_CLOSED);
                m_Stick->WriteMessage(MakeMessage(UNASSIGN_CHANNEL, m_ChannelNumber));
                Buffer response = m_Stick->ReadInternalMessage();
                CheckChannelResponse(response, m_ChannelNumber, UNASSIGN_CHANNEL, 0);
            }
            return;
        }
        else if (event == EVENT_RX_FAIL_GO_TO_SEARCH) {
            m_ChannelId.DeviceNumber = 0;      // lost our device
            ChangeState(CH_SEARCHING);
        }
        else if (event == RESPONSE_NO_ERROR) {
            // we seem to be getting these from time to time, ignore them
        }
        else if (m_AckDataRequestOutstanding) {
            // We received a status for a ACKNOWLEDGE_DATA transmission
            auto tag = m_AckDataQueue.front().tag;
            m_AckDataQueue.pop();
            m_AckDataRequestOutstanding = false;
            OnAcknowledgedDataReply(tag, event);
        }
        else {
#if defined DEBUG_OUTPUT
            std::cerr << "Got unexpected channel event " << (unsigned)event << ": "
                      << ChannelEventAsString (event) << "\n";
#endif
        }
    } else {
#if defined DEBUG_OUTPUT
        std::cerr << "Unexpected reply for command " << (unsigned)msg_id
                  << ": " << (unsigned) event << " " << ChannelEventAsString (event)
                  << std::endl;
#endif
    }

    return;
}

/** Process a RESPONSE_CHANNEL_ID message.  We ask for one when we receive a
 * broadcast data and we used it to identify the master device we are paired
 * with.
 */
void AntChannel::OnChannelIdMessage (const uint8_t *data, int size)
{
    assert(data[2] == RESPONSE_CHANNEL_ID);

    // we asked for this when we received the first broadcast message on the
    // channel.  Normally this would be a logic error in the program (and
    // therefore it should be an assert(), but this is a packet we received
    // from the AntStick...)
    if (data[3] != m_ChannelNumber) {
        throw std::runtime_error ("AntChannel::OnChannelIdMessage: unexpected channel number");
    }

    auto transmission_type = static_cast<TransmissionType>(data[7] & 0x03);
    // note: high nibble of the transmission type byte represents the
    // extended 20bit device number
    uint16_t device_number = data[4] | (data[5] << 8) | ((data[7] >> 4) & 0x0F) << 16;
    uint8_t device_type = data[6];

    if (m_ChannelId.DeviceType == 0) {
        m_ChannelId.DeviceType = device_type;
    } else if (m_ChannelId.DeviceType != device_type) {
        // we seem to have paired up with a different device type than we
        // asked for...
        throw std::runtime_error ("AntChannel::OnChannelIdMessage: unexpected device type");
    }

    if (m_ChannelId.DeviceNumber == 0) {
        m_ChannelId.DeviceNumber = device_number;
    } else if (m_ChannelId.DeviceNumber != device_number) {
        // we seem to have paired up with a different device than we asked
        // for...
        throw std::runtime_error ("AntChannel::OnChannelIdMessage: unexpected device number");
    }

    // NOTE: fist channel id responses might not contain a message ID.
    if (m_ChannelId.DeviceNumber != 0) {
        ChangeState(CH_OPEN);
#if defined DEBUG_OUTPUT
        std::cerr << "Got a device number: " << m_ChannelId.DeviceNumber << "\n";
#endif
    }

    m_IdReqestOutstanding = false;
}

/** Change the channel state to 'new_state' and call OnStateChanged() if the
 * state has actually changed.
 */
void AntChannel::ChangeState(State new_state)
{
    if (m_State != new_state) {
        OnStateChanged(m_State, new_state);
        m_State = new_state;
    }
}

void AntChannel::OnStateChanged (State old_state, State new_state)
{
    // do nothing.  An implementation is provided so any derived classes not
    // interested in state changes can just ignore this.
}

void AntChannel::OnAcknowledgedDataReply(int tag, AntChannelEvent event)
{
    // do nothing.  An implementation is provided so any derived classes not
    // interested in ack data replies can just ignore this.
}


// ........................................................... AntStick ....

const char * AntStickNotFound::what() const /*noexcept*/
{
    return "USB ANT stick not found";
}

uint8_t AntStick::g_AntPlusNetworkKey[8] = {
    0xB9, 0xA5, 0x21, 0xFB, 0xBD, 0x72, 0xC3, 0x45
};

// ANT+ memory sticks vendor and product ids.  We will use the first USB
// device found.
struct ant_stick_devid_ {
    int vid;
    int pid;
} ant_stick_devid[] = {
    {0x0fcf, 0x1008},
    {0x0fcf, 0x1009}
};

int num_ant_stick_devid = sizeof(ant_stick_devid) / sizeof(ant_stick_devid[0]);

/** Find the USB device for the ANT stick.  Return nullptr if not found,
 * throws an exception if there is a problem with the lookup.
 */
libusb_device_handle* FindAntStick()
{
    libusb_device **devs;
    ssize_t devcnt = libusb_get_device_list(nullptr, &devs);
    if (devcnt < 0)
        throw LibusbError("libusb_get_device_list", devcnt);

    libusb_device_handle *ant_stick = nullptr; // the one we are looking for
    bool found_it = false;
    int i = 0;
    libusb_device *dev = nullptr;

    while ((dev = devs[i++]) != nullptr && ! found_it)
    {
        struct libusb_device_descriptor desc;
        int r = libusb_get_device_descriptor(dev, &desc);
        if (r < 0) {
            libusb_free_device_list(devs, 1);
            throw LibusbError("libusb_get_device_descriptor", r);
        }

        for (int i = 0; i < num_ant_stick_devid; ++i)
        {
            if (desc.idVendor == ant_stick_devid[i].vid
                && desc.idProduct == ant_stick_devid[i].pid)
            {
                int r = libusb_open(dev, &ant_stick);
                if (r < 0)
                {
                    throw LibusbError("libusb_open", r);
                }
                found_it = true;
                break;
            }
        }
    }
    libusb_free_device_list(devs, 1);

    return ant_stick;
}

/** Perform USB setup stuff to get the USB device ready for communication.
 */
void ConfigureAntStick(libusb_device_handle *ant_stick)
{
    int r = libusb_claim_interface(ant_stick, 0); // Interface 0 must always exist
    if (r < 0)
        throw LibusbError("libusb_claim_interface", r);

    int actual_config = 0;
    int desired_config = 1; // ant sticks support only one configuration
    r = libusb_get_configuration(ant_stick, &actual_config);
    if (r < 0)
        throw LibusbError("libusb_get_configuration", r);

    if (actual_config != desired_config)
    {
        // According to libusb documentation, we cannot change the
        // configuration if the application has claimed interfaces.
        r = libusb_release_interface(ant_stick, 0);
        if (r < 0)
            throw LibusbError("libusb_release_interface", r);

        std::cerr << "libusb_set_configuration actual = " << actual_config
                  << ", desired = " << desired_config << "\n";
        r = libusb_set_configuration(ant_stick, desired_config);
        if (r < 0)
            throw LibusbError("libusb_set_configuration", r);

        r = libusb_claim_interface(ant_stick, 0); // Interface 0 must always exist
        if (r < 0)
            throw LibusbError("libusb_claim_interface", r);
    }
    r = libusb_reset_device(ant_stick);
    if (r < 0)
        throw LibusbError("libusb_reset_device", r);
}

/** Return the read and write end USB endpoints for the ANT stick device.
 * These will be used to read/write data from/to the ANT stick.
 */
void GetAntStickReadWriteEndpoints(
    libusb_device *ant_stick,
    uint8_t *read_endpoint, uint8_t *write_endpoint)
{
    libusb_config_descriptor *cdesc = nullptr;
    int r = libusb_get_config_descriptor(ant_stick, 0, &cdesc);
    if (r < 0)
        throw LibusbError("libusb_get_config_descriptor", 0);

    try {
        if (cdesc->bNumInterfaces != 1)
        {
            throw std::runtime_error("GetAntStickReadWriteEndpoints: unexpected number of interfaces");
        }
        const libusb_interface *i = cdesc->interface;
        if (i->num_altsetting != 1)
        {
            throw std::runtime_error("GetAntStickReadWriteEndpoints: unexpected number of alternate settings");
        }
        const libusb_interface_descriptor *idesc = i->altsetting;

        for (int e = 0; e < idesc->bNumEndpoints; e++)
        {
            const libusb_endpoint_descriptor *edesc = idesc->endpoint + e;

            uint8_t edir = edesc->bEndpointAddress & LIBUSB_ENDPOINT_DIR_MASK;

            // NOTE: we technically look for the last read and write endpoints,
            // but there should be only one of each anyway.
            switch (edir) {
            case LIBUSB_ENDPOINT_IN:
                *read_endpoint = edesc->bEndpointAddress;
                break;
            case LIBUSB_ENDPOINT_OUT:
                *write_endpoint = edesc->bEndpointAddress;
                break;
            }
        }

        libusb_free_config_descriptor(cdesc);
    }
    catch (...)
    {
        libusb_free_config_descriptor(cdesc);
        throw;
    }
}

AntStick::AntStick()
    : m_DeviceHandle (nullptr),
      m_SerialNumber (0),
      m_Version (""),
      m_MaxNetworks (-1),
      m_MaxChannels (-1),
      m_Network(-1)
{
    try {
        m_DeviceHandle = FindAntStick();
        if (! m_DeviceHandle)
        {
            throw AntStickNotFound();
        }

        // Not needed on Windows, but harmless and needed on Linux.  Don't
        // check return code, as we don't care about it.
        libusb_set_auto_detach_kernel_driver(m_DeviceHandle, 1);

        ConfigureAntStick(m_DeviceHandle);

        uint8_t read_endpoint, write_endpoint;

        auto *device = libusb_get_device(m_DeviceHandle);

        GetAntStickReadWriteEndpoints(
            device, &read_endpoint, &write_endpoint);

        int r = libusb_clear_halt(m_DeviceHandle, read_endpoint);
        if (r < 0) {
            throw LibusbError("libusb_clear_halt(read_endpoint)", r);
        }

        r = libusb_clear_halt(m_DeviceHandle, write_endpoint);
        if (r < 0) {
            throw LibusbError("libusb_clear_halt(write_endpoint)", r);
        }

        auto rt = std::unique_ptr<AntMessageReader>(
            new AntMessageReader (m_DeviceHandle, read_endpoint));
        m_Reader = std::move (rt);

        auto wt = std::unique_ptr<AntMessageWriter>(
            new AntMessageWriter (m_DeviceHandle, write_endpoint));
        m_Writer = std::move (wt);

        Reset();
        QueryInfo();

        m_LastReadMessage.reserve (1024);
    }
    catch (...)
    {
        // Need to clean up, as no one will do it for us....
        m_Reader = std::move (std::unique_ptr<AntMessageReader>());
        m_Writer = std::move (std::unique_ptr<AntMessageWriter>());
        if (m_DeviceHandle)
            libusb_close(m_DeviceHandle);
        throw;
    }
}

AntStick::~AntStick()
{
    m_Reader = std::move (std::unique_ptr<AntMessageReader>());
    m_Writer = std::move (std::unique_ptr<AntMessageWriter>());
    if (m_DeviceHandle) {
        libusb_close(m_DeviceHandle);
    }
}

void AntStick::WriteMessage(const Buffer &b)
{
    m_Writer->WriteMessage (b);
}

/** Read a message from the ANT stick and return it.  This is used only for
 * reading messages indented for the ANT stick and channel management and any
 * broadcast and other messages are queued up so they will be correctly
 * processed by AntStick::Tick()
 */
const Buffer& AntStick::ReadInternalMessage()
{
    auto SetAsideMessage = [] (const Buffer &message) -> bool {
        return (message[2] == BROADCAST_DATA
                || message[2] == BURST_TRANSFER_DATA
                || (message[2] == CHANNEL_RESPONSE
                    && (message[4] == 0x01 ||
                        message[4] == ACKNOWLEDGE_DATA ||
                        message[4] == BURST_TRANSFER_DATA)));
    };

    for(int i = 0; i < 50; ++i) {
        m_Reader->GetNextMessage(m_LastReadMessage);
        if (SetAsideMessage(m_LastReadMessage))
            m_DelayedMessages.push(m_LastReadMessage);
        else
            return m_LastReadMessage;
    }

    m_LastReadMessage.clear();
    return m_LastReadMessage;
}

/** Reset the ANT stick by sending it a reset command.  Also discard any
 * queued up messages, so we don't process anything from the previous ANT
 * Stick user.
 */
void AntStick::Reset()
{
    // At least my AntStick dongle occasionally "forgets" to send a
    // STARTUP_MESSAGE after a RESET_SYSTEM, however, the system appears to
    // work fine.  It is unclear if the system is reset but the startup
    // message is not sent or if the system is not reset at all.

    try {
        WriteMessage(MakeMessage(RESET_SYSTEM, 0));
        int ntries = 50;
        while (ntries-- > 0) {
            Buffer message = ReadInternalMessage();
            if(message.size() >= 2 && message[2] == STARTUP_MESSAGE) {
                std::swap(m_DelayedMessages, std::queue<Buffer>());
                return;
            }
        }
    }
    catch (const std::exception &) {
        // Discard any exceptions for the reset message (there are timeouts
        // from the message reader)
    }

#ifdef DEBUG_OUTPUT
    std::cerr << "AntStick::Reset() -- did not receive STARTUP_MESSAGE\n";
#endif

    // throw std::runtime_error("AntStick::Reset: failed to receive startup message");
}


/** Query basic information from the ANT Stick, such as the serial number,
 * version, maximum networks and channels that it supports.
 */
void AntStick::QueryInfo()
{
    WriteMessage (MakeMessage (REQUEST_MESSAGE, 0, RESPONSE_SERIAL_NUMBER));
    Buffer msg_serial = ReadInternalMessage();
    if (msg_serial[2] != RESPONSE_SERIAL_NUMBER)
        throw std::runtime_error ("AntStick::QueryInfo: unexpected message");
    m_SerialNumber = msg_serial[3] | (msg_serial[4] << 8) | (msg_serial[5] << 16) | (msg_serial[6] << 24);

    WriteMessage (MakeMessage (REQUEST_MESSAGE, 0, RESPONSE_VERSION));
    Buffer msg_version = ReadInternalMessage();
    if (msg_version[2] != RESPONSE_VERSION)
        throw std::runtime_error ("AntStick::QueryInfo: unexpected message");
    const char *version = reinterpret_cast<const char *>(&msg_version[3]);
    m_Version = version;

    WriteMessage (MakeMessage (REQUEST_MESSAGE, 0, RESPONSE_CAPABILITIES));
    Buffer msg_caps = ReadInternalMessage();
    if (msg_caps[2] != RESPONSE_CAPABILITIES)
        throw std::runtime_error ("AntStick::QueryInfo: unexpected message");

    m_MaxChannels = msg_caps[3];
    m_MaxNetworks = msg_caps[4];
}

void AntStick::RegisterChannel (AntChannel *c)
{
    m_Channels.push_back (c);
}

void AntStick::UnregisterChannel (AntChannel *c)
{
    auto i = std::find (m_Channels.begin(), m_Channels.end(), c);
    m_Channels.erase(i);
}

int AntStick::NextChannelId() const
{
    int id = 0;
    for (int i = 0; i < m_MaxChannels; ++i) {
        for (auto j : m_Channels) {
            if (j->m_ChannelNumber == i)
                goto next;
        }
        return i;
    next:
        1 == 2;
    }
    return -1;
}

void AntStick::SetNetworkKey (uint8_t key[8])
{
    // Currently, only one network use is supported, so always use network id
    // 0 for now
    uint8_t network = 0;

    m_Network = -1;
    Buffer nkey;
    nkey.push_back (network);
    nkey.insert (nkey.end(), &key[0], &key[8]);
    WriteMessage (MakeMessage (SET_NETWORK_KEY, nkey));
    Buffer response = ReadInternalMessage();
    CheckChannelResponse (response, network, SET_NETWORK_KEY, 0);
    m_Network = network;
}

bool AntStick::MaybeProcessMessage(const Buffer &message)
{
    auto channel = message[3];

    if (message[2] == BURST_TRANSFER_DATA)
        channel = message[3] & 0x1f;

    for(auto ch : m_Channels) {
        if (ch->m_ChannelNumber == channel) {
            ch->HandleMessage (&message[0], message.size());
            return true;
        }
    }

    return false;
}

void AntStick::Tick()
{
    if (m_DelayedMessages.empty())
    {
        m_Reader->MaybeGetNextMessage(m_LastReadMessage);
    }
    else
    {
        m_LastReadMessage = m_DelayedMessages.front();
        m_DelayedMessages.pop();
    }

    if (m_LastReadMessage.empty()) return;

    //std::cout << "AntStick::Tick() got a message\n";
    //DumpData(&m_LastReadMessage[0], m_LastReadMessage.size(), std::cout);

    if (! MaybeProcessMessage (m_LastReadMessage))
    {
#if defined DEBUG_OUTPUT
        std::cerr << "Unprocessed message:\n";
        DumpData (&m_LastReadMessage[0], m_LastReadMessage.size(), std::cerr);
#endif
    }
}

void TickAntStick(AntStick *s)
{
    s->Tick();
    struct timeval tv;
    tv.tv_sec = 0;
    tv.tv_usec = 10 * 1000;
    int r = libusb_handle_events_timeout_completed (nullptr, &tv, nullptr);
    if (r < 0)
        throw LibusbError("libusb_handle_events_timeout_completed", r);
}
