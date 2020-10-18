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
#pragma once

#include "AntStick.h"

/** Read data and control resistance from an ANT+ FE-C capable trainer.
 * Currently, instant power, speed and cadence can be read, and the slope can
 * be set.
 */
class FitnessEquipmentControl : public AntChannel
{
public:

    enum EquipmentType {
        ET_UNKNOWN = 0,
        ET_GENERAL = 16,
        ET_TREADMILL = 19,
        ET_ELLIPTICAL = 20,
        ET_STATIONARY_BIKE = 21,
        ET_ROWER = 22,
        ET_CLIMBER = 23,
        ET_NORDIC_SKIER = 24,
        ET_TRAINER = 25
    };

    enum TrainerState {
        STATE_RESERVED = 0,
        STATE_ASLEEP = 1,
        STATE_READY = 2,
        STATE_IN_USE = 3,
        STATE_FINISHED = 4,              // PAUSED
    };

    enum SimulationState {
        TS_AT_TARGET_POWER = 0,   // at target power, or no target set
        TS_SPEED_TOO_LOW = 1,     // speed is too low to achieve target power
        TS_SPEED_TOO_HIGH = 2,    // speed is too high to achieve target power
        TS_POWER_LIMIT_REACHED = 3 // undetermined (min or max) power limit reached
    };

    FitnessEquipmentControl(AntStick *stick, uint32_t device_number = 0);

    double InstantPower() const;
    double InstantSpeed() const;
    bool InstantSpeedIsVirtual() const;
    double InstantCadence() const;

    EquipmentType GetEquipmentType() const { return m_EquipmentType; }

    void SetUserParams(
        double user_weight,
        double bike_weight,
        double wheel_diameter);

    void SetSlope(double slope);
    
private:

    void OnMessageReceived(const uint8_t *data, int size) override;
    void SendUserConfigPage();
    void ProcessGeneralPage(const uint8_t *data, int size);
    void ProcessTrainerSpecificPage(const uint8_t *data, int size);
    void ProcessCapabilitiesPage(const uint8_t *data, int size);
    void OnAcknowledgedDataReply(int tag, AntChannelEvent event);
    void OnStateChanged (AntChannel::State old_state, AntChannel::State new_state) override;

    void SendTrackResistanceDataPage();

    // User configuration

    bool m_UpdateUserConfig;
    double m_UserWeight;
    double m_BikeWeight;
    double m_BikeWheelDiameter;

    // Parameters used when trainer is in simulation mode

    double m_WindResistanceCoefficient;
    // negative indicates tailwind
    double m_WindSpeed;
    double m_DraftingFactor;
    double m_Slope;
    double m_RollingResistance;

    // Parameters used when trainer is in basic resistance mode

    double m_TargetResistance;          // 0 - 100%

    // Parameters used when trainer is in target power mode

    double m_TargetPower;

    // Trainer capabilities

    enum CapabilitiesStatus {
        CAPABILITIES_UNKNOWN,
        CAPABILITIES_REQUESTED,
        CAPABILITIES_RECEIVED
    };

    CapabilitiesStatus m_CapabilitiesStatus;
    double m_MaxResistance;
    bool m_BasicResistanceControl;
    bool m_TargetPowerControl;
    bool m_SimulationControl;
    EquipmentType m_EquipmentType;

    // Configuration/Calibration status

    bool m_ZeroOffsetCalibrationRequired;
    bool m_SpinDownCalibrationRequired;
    bool m_UserConfigurationRequired;

    // Trainer output parameters
    uint32_t m_InstantPowerTimestamp;
    double m_InstantPower;
    uint32_t m_InstantSpeedTimestamp;
    double m_InstantSpeed;
    bool m_InstantSpeedIsVirtual;
    uint32_t m_InstantCadenceTimestamp;
    double m_InstantCadence;
    TrainerState m_TrainerState;

    // Only used if we are in target power mode, otherwise it is 0 --
    // TS_AT_TARGET_POWER
    SimulationState m_SimulationState;
};

const char *EquipmentTypeAsString (FitnessEquipmentControl::EquipmentType et);
