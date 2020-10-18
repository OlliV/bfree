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
#pragma once

#include <memory>
#include <queue>
#include <stdint.h>

// TODO: move libusb in the C++ file
#pragma warning (push)
#pragma warning (disable: 4200)
#include <libusb-1.0/libusb.h>
#pragma warning (pop)

typedef std::vector<uint8_t> Buffer;

class AntMessageReader;
class AntMessageWriter;
class AntStick;

enum AntMessageId {
    SYNC_BYTE = 0xA4,
    INVALID = 0x00,

    // Configuration messages
    UNASSIGN_CHANNEL = 0x41,
    ASSIGN_CHANNEL = 0x42,
    SET_CHANNEL_ID = 0x51,
    SET_CHANNEL_PERIOD = 0x43,
    SET_CHANNEL_SEARCH_TIMEOUT = 0x44,
    SET_CHANNEL_RF_FREQ = 0x45,
    SET_NETWORK_KEY = 0x46,
    SET_TRANSMIT_POWER = 0x47,
    SET_SEARCH_WAVEFORM = 0x49, // XXX: Not in official docs
    ADD_CHANNEL_ID = 0x59,
    CONFIG_LIST = 0x5A,
    SET_CHANNEL_TX_POWER = 0x60,
    LOW_PRIORITY_CHANNEL_SEARCH_TIMOUT = 0x63,
    SERIAL_NUMBER_SET_CHANNEL = 0x65,
    ENABLE_EXT_RX_MESGS = 0x66,
    ENABLE_LED = 0x68,
    ENABLE_CRYSTAL = 0x6D,
    LIB_CONFIG = 0x6E,
    FREQUENCY_AGILITY = 0x70,
    PROXIMITY_SEARCH = 0x71,
    CHANNEL_SEARCH_PRIORITY = 0x75,
    // SET_USB_INFO                       = 0xff

    // Notifications
    STARTUP_MESSAGE = 0x6F,
    SERIAL_ERROR_MESSAGE = 0xAE,

    // Control messages
    RESET_SYSTEM = 0x4A,
    OPEN_CHANNEL = 0x4B,
    CLOSE_CHANNEL = 0x4C,
    OPEN_RX_SCAN_MODE = 0x5B,
    REQUEST_MESSAGE = 0x4D,
    SLEEP_MESSAGE = 0xC5,

    // Data messages
    BROADCAST_DATA = 0x4E,
    ACKNOWLEDGE_DATA = 0x4F,
    BURST_TRANSFER_DATA = 0x50,

    // Responses (from channel)
    CHANNEL_RESPONSE = 0x40,

    // Responses (from REQUEST_MESSAGE, 0x4d)
    RESPONSE_CHANNEL_STATUS = 0x52,
    RESPONSE_CHANNEL_ID = 0x51,
    RESPONSE_VERSION = 0x3E,
    RESPONSE_CAPABILITIES = 0x54,
    RESPONSE_SERIAL_NUMBER = 0x61
};

/** Channel events received as part of the CHANNEL_RESPONSE message, defined
 * in section 9.5.6 "Channel Response / Event Messages" in
 * D00000652_ANT_Message_Protocol_and_Usage_Rev_5.1
 */
enum AntChannelEvent {
    RESPONSE_NO_ERROR  = 0,
    EVENT_RX_SEARCH_TIMEOUT = 1,
    EVENT_RX_FAIL = 2,
    EVENT_TX = 3,
    EVENT_TRANSFER_RX_FAILED = 4,
    EVENT_TRANSFER_TX_COMPLETED = 5,
    EVENT_TRANSFER_TX_FAILED = 6,
    EVENT_CHANNEL_CLOSED = 7,
    EVENT_RX_FAIL_GO_TO_SEARCH = 8,
    EVENT_CHANNEL_COLLISION = 9,
    EVENT_TRANSFER_TX_START = 10,
    EVENT_TRANSFER_NEXT_DATA_BLOCK = 17,
    CHANNEL_IN_WRONG_STATE = 21,
    CHANNEL_NOT_OPENED = 22,
    CHANNEL_ID_NOT_SET = 24,
    CLOSE_ALL_CHANNELS = 25,
    TRANSFER_IN_PROGRESS = 31,
    TRANSFER_SEQUENCE_NUMBER_ERROR = 32,
    TRANSFER_IN_ERROR = 33,
    MESSAGE_SIZE_EXCEEDS_LIMIT = 39,
    INVALID_MESSAGE = 40,
    INVALID_NETWORK_NUMBER = 41,
    INVALID_LIST_ID = 48,
    INVALID_SCAN_TX_CHANNEL = 49,
    INVALID_PARAMETER_PROVIDED = 51,
    EVENT_SERIAL_QUE_OVERFLOW = 52,
    EVENT_QUE_OVERFLOW = 53,
    ENCRYPT_NEGOTIATION_SUCCESS = 56,
    ENCRYPT_NEGOTIATION_FAIL = 57,
    NVM_FULL_ERROR = 64,
    NVM_WRITE_ERROR = 65,
    USB_STRING_WRITE_FAIL = 112,
    MESG_SERIAL_ERROR_ID = 174,
    LAST_EVENT_ID = 0xff
};

const char *ChannelEventAsString(AntChannelEvent e);


// ......................................................... AntChannel ....

enum TransmissionType {
    ANT_INDEPENDENT_CHANNEL = 0x01
};

/**
 * Represents an ANT communication channel managed by the AntStick class.
 * This class represents the "slave" endpoint, the master being the
 * device/sensor that sends the data.
 *
 * This class is not useful directly.  It needs to be derived from and at
 * least the ProcessMessage() function implemented to handle messages received
 * on the channel.  The idea is that Heart Rate, Power Meter, etc channels are
 * implemented by deriving from this class and providing access to the
 * relevant user data.
 */
class AntChannel
{
public:

    friend class AntStick;

    /** The Channel ID identifies the master we want to pair up with. In ANT+
     * terminology, a master is the actual sensor sending data, like a Heart
     * Rate monitor, and we are always the "slave".
     */
    struct Id {
        Id(uint8_t device_type, uint32_t device_number = 0)
            : TransmissionType(0),
              DeviceType(device_type),
              DeviceNumber(device_number)
            {
                // empty
            }

        /** Defines the transmission type.  We always set it to 0, once paired
         * up, the master will tell us what the transmission type is.
         */
        uint8_t TransmissionType;

        /** Type of device we want to pair up with (e.g. Heart Rate Monitor,
         * Power Meter, etc).  These are IDs defines in the relevant device
         * profile in the ANT+ documentation.
         */
        uint8_t DeviceType;

        /** The serial number of the device we want to pair up with.  A value
         * of 0 indicates a "search" for any device of DeviceType type.
         */
        uint32_t DeviceNumber;
    };

    /** The state of the channel, you can get the current state with
     * ChannelState()
     */
    enum State {
        CH_SEARCHING,     // Searching for a master
        CH_OPEN,          // Open, receiving broadcast messages from a master
        CH_CLOSED         // Closed, will not receive any messages, object
                          // needs to be destroyed
    };

    AntChannel (AntStick *stick,
                Id channel_id,
                unsigned period,
                uint8_t timeout,
                uint8_t frequency);
    virtual ~AntChannel();

    void RequestClose();
    State ChannelState() const { return m_State; }
    Id ChannelId() const { return m_ChannelId; }
    int MessagesReceived() const { return m_MessagesReceived; }
    int MessagesFailed() const { return m_MessagesFailed; }

protected:
    /* Derived classes can use these methods. */

    /** Send 'message' as an acknowledged message.  The actual message will
     * not be sent immediately (they can only be sent shortly after a
     * broadcast message is received).  OnAcknowledgedDataReply() will be
     * called with 'tag' and the result of the transmission.  If the
     * transmission fails, it will not be retried.
     */
    void SendAcknowledgedData(int tag, const Buffer &message);

    /** Ask a master device to transmit data page identified by 'page_id'.
     * The master will only send some data pages are only sent when requested
     * explicitly.  The request is sent as an acknowledged data message, but a
     * successful transmission does not mean that the master device will send
     * the data page.  The master will send these data pages as normal
     * broadcast data messages and should be processed in OnMessageReceived().
     * They will be send by the master 'transmit_count' number of times (in
     * case the data page is lost due to collisions)
     */
    void RequestDataPage(uint8_t page_id, int transmit_count = 4);

private:
    /* Derived classes will need to override these methods */

    /** Called when a message received on this channel and it is not a status
     * message.  This should be overridden to process and interpret broadcast
     * messages received by the channel.
     */
    virtual void OnMessageReceived (const uint8_t *data, int size) = 0;

    /** Called when the state of the channel has changed. Default
     * implementation does nothing.
     */
    virtual void OnStateChanged (State old_state, State new_state);

    /** Called when we receive the status reply for an acknowledged message we
     * that was sent.  'tag' is the same tag that was passed to
     * SendAcknowledgedData() and can be used to identify which message was
     * sent (or failed to send) 'event' is one of EVENT_TRANSFER_TX_COMPLETED,
     * or EVENT_TRANSFER_TX_FAILED.  Note that failed messages are not
     * retried, the derived class can try again by calling
     * SendAcknowledgedData()
     */
    virtual void OnAcknowledgedDataReply(int tag, AntChannelEvent event);

private:

    State m_State;
    Id m_ChannelId;
    /** The channel number is a unique identifier assigned by the AntStick it
     * is used when assembling messages or decoding messages received by the
     * ANT Stick. */
    int m_ChannelNumber;

    /** A queued ACKNOWLEDGE_DATA message.  We can only send these messages
     * one-by-one when a broadcast message is received, so
     * SendAcknowledgedData() queues them up.
     */
    struct AckDataItem {
        AckDataItem(int t, const Buffer &d)
            : tag(t), data(d) {}
        int tag;
        Buffer data;
    };

    /** Queue of ACKNOWLEDGE_DATA messages waiting to be sent.
     */
    std::queue<AckDataItem> m_AckDataQueue;

    /** When true, an ACKNOWLEDGE_DATA message was send out and we have not
     * received confirmation for it yet.
     */
    bool m_AckDataRequestOutstanding;

    /** When true, a Channel ID request is outstanding.  We always identify
     * channels when we receive the first broadcast message on them.
     */
    bool m_IdReqestOutstanding;

    AntStick *m_Stick;

    /** Number of broadcast messages received (the broadcast messages contain
     * useful data from the sensors).
     */
    int m_MessagesReceived;

    /** Number of times we failed to receive a message.
     */
    int m_MessagesFailed;

    void Configure (unsigned period, uint8_t timeout, uint8_t frequency);
    void HandleMessage(const uint8_t *data, int size);
    void MaybeSendAckData();
    void OnChannelResponseMessage (const uint8_t *data, int size);
    void OnChannelIdMessage (const uint8_t *data, int size);
    void ChangeState(State new_state);
};


// ........................................................... AntStick ....

/** Exception thrown when the ANT stick is not found (perhaps because it is
    not plugged into a USB port). */
class AntStickNotFound : public std::exception
{
public:
    const char * what() const /*noexcept*/ override;
};


/**
 * Represents the physical USB ANT Stick used to communicate with ANT+
 * devices.  An ANT Stick manages one or more AntChannel instances.  The
 * Tick() method needs to be called periodically to process the received
 * messages and distribute them to the AntChannel instances.  In addition to
 * that, `libusb_handle_events_timeout_completed` or equivalent needs to be
 * called periodically to allow libusb to process messages.  See also
 * `TickAntStick()`
 *
 * @hint Don't forget to call libusb_init() somewhere in your program before
 * using this class.
 */
class AntStick
{
    friend AntChannel;

public:
    AntStick();
    ~AntStick();

    void SetNetworkKey (uint8_t key[8]);

    unsigned GetSerialNumber() const { return m_SerialNumber; }
    std::string GetVersion() const { return m_Version; }
    int GetMaxNetworks() const { return m_MaxNetworks; }
    int GetMaxChannels() const { return m_MaxChannels; }
    int GetNetwork() const { return m_Network; }

    void Tick();

    static uint8_t g_AntPlusNetworkKey[8];

private:

    void WriteMessage(const Buffer &b);
    const Buffer& ReadInternalMessage();

    void Reset();
    void QueryInfo();
    void RegisterChannel (AntChannel *c);
    void UnregisterChannel (AntChannel *c);
    int NextChannelId() const;

    bool MaybeProcessMessage(const Buffer &message);

    libusb_device_handle *m_DeviceHandle;

    unsigned m_SerialNumber;
    std::string m_Version;
    int m_MaxNetworks;
    int m_MaxChannels;

    int m_Network;

    std::queue <Buffer> m_DelayedMessages;
    Buffer m_LastReadMessage;

    std::unique_ptr<AntMessageReader> m_Reader;
    std::unique_ptr<AntMessageWriter> m_Writer;

    std::vector<AntChannel*> m_Channels;
};

/** Call libusb_handle_events_timeout_completed() than the AntStick's Tick()
 * method.  This is an all-in-one function to get the AntStick to work, but it
 * is only appropriate if the application communicates with a single USB
 * device.
 *
 * @hint Don't forget to call libusb_init() somewhere in your program before
 * using this function.
 */
void TickAntStick(AntStick *s);

/*
  Local Variables:
  mode: c++
  End:
*/
