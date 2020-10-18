/**
 *  TelemetryServer -- manage a bike trainer
 *  Copyright (C) 2017 Alex Harsanyi (AlexHarsanyi@gmail.com)
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
#include "TelemetryServer.h"
#include "Tools.h"

std::ostream& operator<<(std::ostream &out, const Telemetry &t)
{
    if (t.hr >= 0)
        out << "HR: " << t.hr;
    if (t.cad >= 0)
        out << ";CAD: " << t.cad;
    if (t.pwr >= 0)
        out << ";PWR: " << t.pwr;
    if (t.spd >= 0)
        out << ";SPD: " << t.spd;
    return out;
}

bool SendMessage(SOCKET s, const char *msg, int len)
{
    int r = send(s, msg, len, 0);
    if (r == SOCKET_ERROR) {
        auto last_error = WSAGetLastError();
        if (WSAECONNRESET == last_error)
            return false;
        throw Win32Error("send()", last_error);
    }
    if (r < len) {
        throw std::runtime_error("send_data: short write to server");
    }
    return true;
}

// read a '\n' terminated message from socket s
std::string ReadMessage(SOCKET s)
{
    std::string message;
    // NOTE: we are very inefficient, as we are reading bytes one-by-one. To
    // improve this, we need to associate a receive buffer with a socket,
    // because we can't put things back and we don't know how much to read...
    while (true) {
        char buf[1];
        int len = sizeof(buf);
        int r = recv(s, &buf[0], len, 0);
        if (r == 0) // socket was closed
            return message;
        if (r == SOCKET_ERROR)
            throw Win32Error("recv()", WSAGetLastError());
        if (buf[0] == '\n')
            return message;
        message.push_back(buf[0]);
    }
}

TelemetryServer::TelemetryServer (AntStick *stick, int port)
    : m_AntStick (stick),
      m_Hrm (nullptr),
      m_Fec (nullptr)
{
    try {
        auto server = tcp_listen(port);
        std::cout << "Started server on port " << port << std::endl;
        m_Clients.push_back(server);
        m_Hrm = new HeartRateMonitor (m_AntStick);
        m_Fec = new FitnessEquipmentControl (m_AntStick);
    }
    catch (...) {
        if (m_Clients.size() > 0)
            closesocket(m_Clients.front());
        delete m_Hrm;
        delete m_Fec;
    }
}

TelemetryServer::~TelemetryServer()
{
    for (auto i = begin (m_Clients); i != end (m_Clients); ++i)
        closesocket (*i);
    delete m_Hrm;
    delete m_Fec;
}

void TelemetryServer::Tick()
{
#if 1
    TickAntStick (m_AntStick);
    CheckSensorHealth();
#endif
    Telemetry t;
#if 1
    CollectTelemetry (t);
#else
    t.cad = 78;
    t.hr = 146;
    t.spd = 4.2;
    t.pwr = 214;
#endif
    ProcessClients (t);
}

void TelemetryServer::CheckSensorHealth()
{
    if (m_Hrm && m_Hrm->ChannelState() == AntChannel::CH_CLOSED) {
        std::cout << "Creating new HRM channel" << std::endl;
        auto device_number = m_Hrm->ChannelId().DeviceNumber;
        delete m_Hrm;
        m_Hrm = nullptr;
        // Try to connect again, but we now look for the same device, don't
        // change HRM sensors mid-simulation.
        m_Hrm = new HeartRateMonitor (m_AntStick, device_number);
    }

    if (m_Fec && m_Fec->ChannelState() == AntChannel::CH_CLOSED) {
        auto device_number = m_Fec->ChannelId().DeviceNumber;
        delete m_Fec;
        m_Fec = nullptr;
        m_Fec = new FitnessEquipmentControl (m_AntStick, device_number);
    }
}

void TelemetryServer::CollectTelemetry (Telemetry &out)
{
    if (m_Hrm && m_Hrm->ChannelState() == AntChannel::CH_OPEN)
        out.hr = m_Hrm->InstantHeartRate();
    
    if (m_Fec && m_Fec->ChannelState() == AntChannel::CH_OPEN) {
        out.cad = m_Fec->InstantCadence();
        out.pwr = m_Fec->InstantPower();
        out.spd = m_Fec->InstantSpeed();
    }
}

void TelemetryServer::ProcessClients(const Telemetry &t)
{
    std::ostringstream text;
    text << "TELEMETRY " << t << "\n";
    std::string message = text.str();

    auto status = get_socket_status(m_Clients, 10);
    // NOTE: first item in list is the server socket, a SK_READ flag on it
    // means there's a client waiting on it
    if (status[0] & SK_READ) {
        auto client = tcp_accept(m_Clients[0]);
        std::cout << "Accepted connection from " << get_peer_name(client) << std::endl;
        m_Clients.push_back(client);
    }

    std::vector<SOCKET> closed_sockets;

    // for the remaining clients, just send some data if they are ready
    for (unsigned i = 1; i < status.size(); ++i) {
        if (status[i] & SK_WRITE) {
            try {
                if (!SendMessage(m_Clients[i], message.c_str(), message.length())) {
                    closed_sockets.push_back(m_Clients[i]);
                }
            }
            catch (const std::exception &e) {
                std::cerr << get_peer_name(m_Clients[i]) << ": " << e.what() << std::endl;
                closed_sockets.push_back(m_Clients[i]);
            }
        }
        if (status[i] & SK_READ) {
            auto message = ReadMessage(m_Clients[i]);
            ProcessMessage(message);
        }
    }

    // remove any closed sockets from the list
    auto e = end(m_Clients);
    for (auto i = begin(closed_sockets); i != end(closed_sockets); i++) {
        std::cout << "Closing socket for " << get_peer_name(*i) << std::endl;
        e = std::remove(begin(m_Clients), e, *i);
        closesocket(*i);
    }
    m_Clients.erase(e, end(m_Clients));
}

void TelemetryServer::ProcessMessage(const std::string &message)
{
    //std::cout << "Received message: <" << message << ">\n";
    std::istringstream input(message);
    std::string command;
    double param;
    input >> command >> param;
    if(command == "SET-SLOPE" && m_Fec) {
        m_Fec->SetSlope(param);
    }
}
