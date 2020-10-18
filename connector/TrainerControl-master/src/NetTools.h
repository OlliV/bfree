/**
 *  NetTools -- convenient wrappers for socket functions
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

#include <WinSock2.h>
#include <windows.h>
#include <string>
#include <vector>
#include <stdint.h>

SOCKET tcp_listen(int port);
SOCKET tcp_accept(SOCKET server);
SOCKET tcp_connect (const std::string &server, int port);
std::string get_peer_name (SOCKET s);

enum {
    SK_READ = 0x01,
    SK_WRITE = 0x02,
    SK_EXCEPT = 0x04
};

// timeout is in milliseconds
std::vector<uint8_t>
get_socket_status(const std::vector<SOCKET> &sockets, uint64_t timeout);
