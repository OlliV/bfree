export function isValidUnsigned(value) {
	if (Number.isNaN(value)) {
		return false;
	}
	if (value <= 0) {
		return false;
	}
	return true;
}
