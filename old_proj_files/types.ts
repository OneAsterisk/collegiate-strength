/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Lift {
	rank?: number;
	displayName: string;
	gender?: string;
	userName?: string;
	squat: number;
	bench: number;
	deadlift: number;
	age: number;
	total: number;
	dotsScore: number;
	selectedUniversity: string;
	timestamp: any; // From Firebase
	formattedDate: string; // Derived property for UI
	userId: string;
	liftUID: string;
	liftID?: string; //Legacy field
	liftType: string;
	bodyWeight: number;
}

export interface UserInfo {
	displayName: string;
	gender: string;
	selectedUniversity: string;
	userName: string;
}
