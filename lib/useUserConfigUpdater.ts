import { useEffect } from 'react';
import { useGlobalState } from '../lib/global';

export default function useUserConfigUpdater() {
	const [userWeightKg] = useGlobalState('rider');
	const [{ weight: bikeWeightKg, wheelCircumference }] = useGlobalState('bike');
	const [smartTrainerControl] = useGlobalState('smart_trainer_control');

	useEffect(() => {
		if (smartTrainerControl) {
			smartTrainerControl
				.sendUserConfiguration({
					userWeightKg,
					bikeWeightKg,
					wheelCircumference,
				})
				.catch(console.error);
		}
	}, [userWeightKg, bikeWeightKg, wheelCircumference, smartTrainerControl]);
}
