/**
 *  HeartRateMonitor -- communicate with an ANT+ HRM 
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
#pragma once

#include "AntStick.h"

/** Receive data from an ANT+ heart rate monitor. 
 *
 * @warning At this time, only the InstantHeartRate() is received and there is
 * no mechanism implemented to provide average HR information when broadcasts
 * are missed (as described in the profile document), "correct" R-R interval
 * measurement is also not implemented.
 **/
class HeartRateMonitor : public AntChannel
{
public:

    HeartRateMonitor(AntStick *stick, uint32_t device_number = 0);
    double InstantHeartRate() const;

private:
    void OnMessageReceived(const unsigned char *data, int size) override;
    void OnStateChanged (AntChannel::State old_state, AntChannel::State new_state) override;
    
    int m_LastMeasurementTime;
    int m_MeasurementTime;
    int m_HeartBeats;
    uint32_t m_InstantHeartRateTimestamp;
    double m_InstantHeartRate;
};
