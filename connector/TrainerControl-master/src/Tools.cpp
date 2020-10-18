/**
 *  Tools -- various utilities
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
#include "Tools.h"

#pragma warning (push)
#pragma warning (disable:4200)
#include <libusb-1.0/libusb.h>
#pragma warning (pop)

#include <iostream>
#include <iomanip>
#include <locale>

#ifdef WIN32
#pragma comment (lib, "libusb-1.0.lib")
// winmm is needed for the timeGetTime() call
#pragma comment (lib, "winmm.lib")
#endif


// ........................................................ LibusbError ....

LibusbError::~LibusbError()
{
    // empty
}

const char* LibusbError::what() const /*noexcept(true)*/
{
    if (!m_MessageDone) {
        std::ostringstream msg;
        msg << m_Who << ": (" << m_ErrorCode << ") "
            << libusb_error_name(m_ErrorCode);
        m_Message = msg.str();
        m_MessageDone = true;
    }
    return m_Message.c_str();
}


// ......................................................... Win32Error ....

Win32Error::Win32Error (const std::string &who, unsigned long error)
    : m_Who (who),
      m_ErrorCode(error),
      m_MessageDone(false)
{
    if (m_ErrorCode == 0)
        m_ErrorCode = GetLastError();
}

Win32Error::~Win32Error()
{
    // empty
}

const char* Win32Error::what() const
{
    if (! m_MessageDone) {
        LPVOID buf = NULL;

        FormatMessageA(
            FORMAT_MESSAGE_ALLOCATE_BUFFER |
            FORMAT_MESSAGE_FROM_SYSTEM,
            NULL,
            m_ErrorCode,
            MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT),
            (LPSTR) &buf,
            0, NULL );

        // remove the newline from the end
        char *p = strchr((char*)buf, '\r');
        if (p) {
            *p = '\0';
        }

        std::ostringstream msg;
        msg << m_Who << " error " << m_ErrorCode << ": " << (char*)buf;
        m_Message = msg.str();
        LocalFree(buf);
        m_MessageDone = true;
    }

    return m_Message.c_str();
}


/** Print a hex dump of 'data' to the stream 'o'.  The data is printed on
 * lines with the address, character representation and hex representation on
 * each line.  This hopefully makes it easy to determine the contents of both
 * character and binary data.
 */
void DumpData (const unsigned char *data, int size, std::ostream &o)
{
    int ncols = 16;
    int nrows = size / ncols;
    int spill = size - nrows * ncols;
    std::ios::fmtflags saved = o.flags();

    auto pchar = [] (char c, std::locale &loc) -> char
        {
            char npc = '?';         // char to print if the character is not
            // printable
            if (std::isspace (c, loc) && c != ' ')
                return npc;

            if (std::isprint (c, loc))
                return c;

            return npc;
        };

    std::locale loc = o.getloc();
    o << std::hex << std::setfill ('0');

    for (int row = 0; row < nrows; ++row)
    {
        o << std::setw (4) << row*ncols << " ";
        for (int col = 0; col < ncols; ++col)
        {
            int idx = row * ncols + col;
            o << pchar(data[idx], loc);
        }
        o << '\t';
        for (int col = 0; col < ncols; ++col)
        {
            int idx = row * ncols + col;
            o << std::setw (2) << static_cast<unsigned>(data[idx]) << " ";
        }
        o << '\n';
    }

    if (spill)
    {
        o << std::setw (4) << nrows*ncols << " ";
        for (int idx = size - spill; idx < size; ++idx)
        {
            o << pchar (data[idx], loc);
        }

        for (int idx = 0; idx < ncols - spill; ++idx)
        {
            o << ' ';
        }

        o << '\t';
        for (int idx = size - spill; idx < size; ++idx)
        {
            o << std::setw (2) << static_cast<unsigned>(data[idx]) << " ";
        }

        o << '\n';
    }

    o.flags (saved);
}

uint32_t CurrentMilliseconds()
{
    return timeGetTime();
}

#if 0
void PutTimestamp(std::ostream &o)
{
    struct timespec tsp;
    
    if (clock_gettime(CLOCK_REALTIME, &tsp) < 0) {
        perror("clock_gettime");
        return;
    }
    struct tm tm = *localtime(&tsp.tv_sec);

    unsigned msec = tsp.tv_nsec / 1000000;
    
    o << std::setfill('0')
      << std::setw(4) << tm.tm_year + 1900
      << '-' << std::setw(2) << tm.tm_mon + 1
      << '-' << std::setw(2) << tm.tm_mday
      << ' ' << std::setw(2) << tm.tm_hour
      << ':' << std::setw(2) << tm.tm_min
      << ':' << std::setw(2) << tm.tm_sec
      << '.' << std::setw(4) << msec << ' ';
}
#endif

