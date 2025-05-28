export const convertWeight = (weight: number, unit: 'lbs' | 'kg'): number => {
	if (unit === 'kg') {
		return Math.round((weight / 2.205) * 2) / 2;
	}
	return Math.round(weight * 2) / 2;
};

// Helper function to generate a consistent university URL slug
export function getUniversityUrlSlug(universityName: string): string {
	if (!universityName) return '';

	// For URL generation, we want to use a simplified but recognizable version
	// Remove campus designations but keep the main university name
	return universityName
		.split(' -')[0] // Remove everything after the first dash (campus designations)
		.trim();
}

// Helper function to get display name for university (for showing in UI)
export function getUniversityDisplayName(universityName: string): string {
	if (!universityName) return '';

	// For display, we can show the full name but clean it up slightly
	return universityName
		.split(' -')[0] // Remove everything after the first dash for consistency
		.trim();
}
