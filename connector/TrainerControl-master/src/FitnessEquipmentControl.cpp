/**
 *  FitnessEquipmentControl -- communicate with an ANT+ FE-C trainer
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
#include "FitnessEquipmentControl.h"
#include "Tools.h"
#include <iostream>
#include <iomanip>

/** IMPLEMENTATION NOTE 
 * 
 * Implementation of the ANT+ Fitness Equipment Device profile is based on the
 * "D000001231_-_ANT+_Device_Profile_-_Fitness_Equipment_-_Rev_4.2.pdf"
 * document available from https://www.thisisant.com
 */

namespace {

// Values taken from the HRM ANT+ Device Profile document
enum {
    ANT_DEVICE_TYPE = 0x11,
    CHANNEL_PERIOD = 8192,
    CHANNEL_FREQUENCY = 57,
    SEARCH_TIMEOUT = 30
};

enum {
    DP_GENERAL = 0x10,
    DP_TRAINER_SPECIFIC = 0x19,
    DP_USER_CONFIG = 0x37,
    DP_FE_CAPABILITIES = 0x36,
    DP_BASIC_RESISTANCE = 0x30,
    DP_TARGET_POWER = 0x31,
    DP_WIND_RESISTANCE = 0x32,
    DP_TRACK_RESISTANCE = 0x33
};

// amount of time in milliseconds before values become stale.
enum {
    STALE_TIMEOUT = 5000
};

};                                      // end anonymous namespace

FitnessEquipmentControl::FitnessEquipmentControl(AntStick *stick, uint32_t device_number)
    : AntChannel(stick,
                 AntChannel::Id(ANT_DEVICE_TYPE, device_number),
                 CHANNEL_PERIOD,
                 SEARCH_TIMEOUT,
                 CHANNEL_FREQUENCY)
{
    // Set some reasonable defaults for all parameters
    m_UpdateUserConfig = true;
    m_UserWeight = 75.0;
    m_BikeWeight = 10.0;
    m_BikeWheelDiameter = 0.668;

    m_WindResistanceCoefficient = 0.51; // default value from device profile
    m_WindSpeed = 0;
    // A drafting factor of 1 indicates no drafting effect (i.e riding alone
    // or at the front of the pack), a drafting factor of 0 removes all air
    // resistance from the simulation.
    m_DraftingFactor = 1.0;
    m_Slope = 0;
    // Value recommended by the device profile for asphalt road.
    m_RollingResistance = 0.004;

    m_TargetResistance = 0;
    m_TargetPower = 0;

    m_CapabilitiesStatus = CAPABILITIES_UNKNOWN;
    m_MaxResistance = 0;
    m_BasicResistanceControl = false;
    m_TargetPowerControl = false;
    m_SimulationControl = false;

    m_ZeroOffsetCalibrationRequired = false;
    m_SpinDownCalibrationRequired = false;
    m_UserConfigurationRequired = false;

    // Trainer output parameters
    auto ts = CurrentMilliseconds();
    m_InstantPowerTimestamp = ts;
    m_InstantPower = 0;
    m_InstantSpeedTimestamp = ts;
    m_InstantSpeed = 0;
    m_InstantSpeedIsVirtual = false;
    m_InstantCadenceTimestamp = ts;
    m_InstantCadence = 0;
    m_TrainerState = STATE_RESERVED;
    m_SimulationState = TS_AT_TARGET_POWER;
}

double FitnessEquipmentControl::InstantPower() const
{
    if ((CurrentMilliseconds() - m_InstantPowerTimestamp) > STALE_TIMEOUT) {
        return 0;
    } else {
        return m_InstantPower;
    }
}

double FitnessEquipmentControl::InstantSpeed() const
{
    if ((CurrentMilliseconds() - m_InstantPowerTimestamp) > STALE_TIMEOUT) {
        return 0;
    } else {
        return m_InstantSpeed;
    }
}

bool FitnessEquipmentControl::InstantSpeedIsVirtual() const
{
    return m_InstantSpeedIsVirtual;
}

double FitnessEquipmentControl::InstantCadence() const
{
    if ((CurrentMilliseconds() - m_InstantPowerTimestamp) > STALE_TIMEOUT) {
        return 0;
    } else {
        return m_InstantCadence;
    }
}

void FitnessEquipmentControl::SetUserParams(
    double user_weight,
    double bike_weight,
    double wheel_diameter)
{
    m_UserWeight = user_weight;
    m_BikeWeight = bike_weight;
    m_BikeWheelDiameter = wheel_diameter;
    m_UpdateUserConfig = true;
}

void FitnessEquipmentControl::OnMessageReceived(const uint8_t *data, int size)
{
    if (data[2] != BROADCAST_DATA)
        return;

    switch(data[4]) {
    case DP_GENERAL:
        ProcessGeneralPage(data + 4, size - 4);
        break;
    case DP_TRAINER_SPECIFIC:
        ProcessTrainerSpecificPage(data + 4, size - 4);
        break;
    case DP_FE_CAPABILITIES:
        ProcessCapabilitiesPage(data + 4, size - 4);
        break;
    default:
#if 0
        std::cout << "FitnessEquipmentControl unknown data page: \n";
        DumpData(data, size, std::cout);
#endif
        break;
    }

    if (ChannelId().DeviceNumber == 0) {
        // Don't request anything until we have a device number
    } else if (m_CapabilitiesStatus == CAPABILITIES_UNKNOWN) {
        RequestDataPage(DP_FE_CAPABILITIES);
        m_CapabilitiesStatus = CAPABILITIES_REQUESTED;
    }
    else if (m_UpdateUserConfig) {
        SendUserConfigPage();
    }
}

void FitnessEquipmentControl::SendUserConfigPage()
{
    std::cout << "Sending user config:\n"
        << "\tRider Weight:   " << std::setprecision(2) << m_UserWeight << " kg\n"
        << "\tBike Weight:    " << std::setprecision(2) << m_BikeWeight << " kg\n"
        << "\tWheel Diameter: " << std::setprecision(4) << m_BikeWheelDiameter << " meters"
        << std::endl;
    uint16_t uw = static_cast<uint16_t>(m_UserWeight / 0.01);
    uint16_t bw = static_cast<uint16_t>(m_BikeWeight / 0.05);
    // Wheel size in centimeters
    uint16_t ws = static_cast<uint16_t>(m_BikeWheelDiameter / 0.01);
    // The 10 mm part of wheel size
    uint16_t ws1 = static_cast<uint16_t>(m_BikeWheelDiameter / 0.001) - ws * 10;

    Buffer msg;
    msg.push_back(DP_USER_CONFIG);
    msg.push_back(uw & 0xFF);
    msg.push_back((uw >> 8) & 0xFF);
    msg.push_back(0xFF);            // reserved
    msg.push_back((ws1 & 0x3) | ((bw | 0x03) << 4));
    msg.push_back((bw >> 4) & 0xFF);
    msg.push_back(ws & 0xFF);
    msg.push_back(0x00);            // gear ratio -- we send invalid value

    SendAcknowledgedData(DP_USER_CONFIG, msg);
    m_UpdateUserConfig = false;
}

void FitnessEquipmentControl::ProcessGeneralPage(
    const uint8_t *data, int size)
{
    uint8_t capabilities = data[7] & 0x0f;
    // NOTE: bit 3 is the lap toggle field, which we don't use
    m_TrainerState = static_cast<TrainerState>((data[7] >> 4) & 0x07);
    uint8_t speed_lsb = data[4];
    uint8_t speed_msb = data[5];
    m_InstantSpeedTimestamp = CurrentMilliseconds();
    m_InstantSpeed = ((speed_msb << 8) + speed_lsb) * 0.001;
    m_InstantSpeedIsVirtual = (capabilities & 0x3) != 0;
    m_EquipmentType = static_cast<EquipmentType>(data[1] & 0x1F);
}

void FitnessEquipmentControl::ProcessTrainerSpecificPage(
    const uint8_t *data, int size)
{
    uint8_t trainer_status = (data[6] >> 4) & 0x0f;
    uint8_t flags = data[7] & 0x0f;
    // NOTE: bit 3 is the lap toggle field, which we don't use
    m_TrainerState = static_cast<TrainerState>((data[7] >> 4) & 0x07);
    uint8_t power_lsb = data[5];
    uint8_t power_msb = data[6] & 0x0F;
    auto ts = CurrentMilliseconds();
    m_InstantPowerTimestamp = ts;
    m_InstantPower = (power_msb << 8) + power_lsb;
    m_SimulationState = static_cast<SimulationState>(flags & 0x03);
    m_InstantPowerTimestamp = ts;
    m_InstantCadence = data[2];
    m_ZeroOffsetCalibrationRequired = (trainer_status & 0x01) != 0;
    m_SpinDownCalibrationRequired = (trainer_status & 0x02) != 0;
    m_UserConfigurationRequired = (trainer_status & 0x04) != 0;
    m_UpdateUserConfig = m_UpdateUserConfig | m_UserConfigurationRequired;
}

void FitnessEquipmentControl::ProcessCapabilitiesPage(
    const uint8_t *data, int size)
{
    m_MaxResistance = (data[6] << 8) + data[5];
    uint8_t capabilities = data[7];
    bool BasicResistanceControl = (capabilities & 0x01) != 0;
    bool TargetPowerControl = (capabilities & 0x02) != 0;
    bool SimulationControl = (capabilities & 0x04) != 0;

    // We can receive this data page multiple times
    if (m_CapabilitiesStatus != CAPABILITIES_RECEIVED
        || BasicResistanceControl != m_BasicResistanceControl
        || TargetPowerControl != m_TargetPowerControl
        || SimulationControl != m_SimulationControl)
    {
        m_CapabilitiesStatus = CAPABILITIES_RECEIVED;
        m_BasicResistanceControl = BasicResistanceControl;
        m_TargetPowerControl = TargetPowerControl;
        m_SimulationControl = SimulationControl;

        std::cout << "Got trainer capabilities:\n"
            << "\tMax Resistance: " << m_MaxResistance << " Newtons\n"
            << "\tControl Modes:  "
            << (m_BasicResistanceControl ? "Basic Resistance" : "")
            << (m_TargetPowerControl ? "; Target Power" : "")
            << (m_SimulationControl ? "; Simulation" : "")
            << std::endl;
    }
}

void FitnessEquipmentControl::OnAcknowledgedDataReply(
    int tag, AntChannelEvent event)
{
    if (event != EVENT_TRANSFER_TX_COMPLETED) {
        // Reset relevant state to send requests again
        if (tag == DP_FE_CAPABILITIES) {
            m_CapabilitiesStatus = CAPABILITIES_UNKNOWN;            
        } else if (tag == DP_USER_CONFIG) {
            m_UpdateUserConfig = true;
        } else if (tag == DP_TRACK_RESISTANCE) {
            SendTrackResistanceDataPage();
        }
    }
}

void FitnessEquipmentControl::OnStateChanged (
    AntChannel::State old_state, AntChannel::State new_state)
{
    if (new_state == AntChannel::CH_OPEN) {
        std::cout << "Connected to ANT+ FE-C with serial " << ChannelId().DeviceNumber << std::endl;
    }

    if (new_state != AntChannel::CH_OPEN) {
        m_CapabilitiesStatus = CAPABILITIES_UNKNOWN;
        m_MaxResistance = 0;
        m_BasicResistanceControl = false;
        m_TargetPowerControl = false;
        m_SimulationControl = false;

        m_ZeroOffsetCalibrationRequired = false;
        m_SpinDownCalibrationRequired = false;
        m_UserConfigurationRequired = false;

        // Trainer output parameters
        m_InstantPower = 0;
        m_InstantSpeed = 0;
        m_InstantSpeedIsVirtual = false;
        m_InstantCadence = 0;
        m_TrainerState = STATE_RESERVED;
        m_SimulationState = TS_AT_TARGET_POWER;
    }
}

void FitnessEquipmentControl::SetSlope(double slope)
{
    std::cout << "Set Slope to " << slope << std::endl;
    m_Slope = slope;
    SendTrackResistanceDataPage();
}

void FitnessEquipmentControl::SendTrackResistanceDataPage()
{
    Buffer msg;
    msg.push_back(DP_TRACK_RESISTANCE);
    msg.push_back(0xFF);
    msg.push_back(0xFF);
    msg.push_back(0xFF);
    msg.push_back(0xFF);
    uint16_t raw_slope = static_cast<uint16_t>((m_Slope + 200.0) / 0.01);
    msg.push_back(raw_slope & 0xFF);
    msg.push_back((raw_slope >> 8) & 0xFF);
    uint8_t raw_rr = static_cast<uint8_t>(m_RollingResistance * 5e5);
    msg.push_back(raw_rr);
    SendAcknowledgedData(DP_TRACK_RESISTANCE, msg);
}

namespace {

struct EquipmentTypeName {
    FitnessEquipmentControl::EquipmentType type;
    const char *name;
} g_EquipmentTypeNames[] = {
    { FitnessEquipmentControl::ET_GENERAL, "general" },
    { FitnessEquipmentControl::ET_TREADMILL, "treadmill" },
    { FitnessEquipmentControl::ET_ELLIPTICAL, "elliptical" },
    { FitnessEquipmentControl::ET_STATIONARY_BIKE, "stationary bike" },
    { FitnessEquipmentControl::ET_ROWER, "rower" },
    { FitnessEquipmentControl::ET_CLIMBER, "climber" },
    { FitnessEquipmentControl::ET_NORDIC_SKIER, "nordic skier"},
    { FitnessEquipmentControl::ET_TRAINER, "trainer" },
    { FitnessEquipmentControl::ET_UNKNOWN, "unknown" }
};

};                                      // end anonymous namespace

const char *EquipmentTypeAsString (FitnessEquipmentControl::EquipmentType et)
{
    for (int i = 0; g_EquipmentTypeNames[i].type != FitnessEquipmentControl::ET_UNKNOWN; i++) {
        if (g_EquipmentTypeNames[i].type == et)
            return g_EquipmentTypeNames[i].name;
    }
    return "unknown";
}

