/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from '$lib/firebase';
import {
	collection,
	doc,
	setDoc,
	getDoc,
	addDoc,
	query,
	orderBy,
	limit,
	onSnapshot,
	updateDoc,
	serverTimestamp,
	where,
	getDocs,
	deleteDoc
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { Lift, UserInfo } from './types';
import { weightUnit } from './stores/weightUnitStore';
import { get } from 'svelte/store';

// Interface for a user's document
interface UserData {
	displayName: string;
	email: string;
	gender: string;
	university: string;
	userName: string;
	stats: {
		bestDots: number;
		bestTotal: number;
		lastLiftDate: any;
		totalLifts: number;
	};
	createdAt: any;
	updatedAt: any;
}

function ageCoefCalc(age: number, dotsScore: number): number {
	switch (age) {
		case 14:
			return parseFloat((dotsScore * 1.23).toFixed(2));
		case 15:
			return parseFloat((dotsScore * 1.18).toFixed(2));
		case 16:
			return parseFloat((dotsScore * 1.13).toFixed(2));
		case 17:
			return parseFloat((dotsScore * 1.08).toFixed(2));
		case 18:
			return parseFloat((dotsScore * 1.06).toFixed(2));
		case 19:
			return parseFloat((dotsScore * 1.04).toFixed(2));
		case 20:
			return parseFloat((dotsScore * 1.03).toFixed(2));
		case 21:
			return parseFloat((dotsScore * 1.02).toFixed(2));
		case 22:
			return parseFloat((dotsScore * 1.01).toFixed(2));
		default:
			return parseFloat(dotsScore.toFixed(2));
	}
}

function Calculate_DOTS(bodyWeight: number, total: number, gender: string): number {
	total = total / 2.205;
	bodyWeight = bodyWeight / 2.205;
	const maleCoeff = [-307.75076, 24.0900756, -0.1918759221, 0.0007391293, -0.000001093];
	const femaleCoeff = [-57.96288, 13.6175032, -0.1126655495, 0.0005158568, -0.0000010706];
	const isFemale = gender === 'Female' ? true : false;
	let denominator = isFemale ? femaleCoeff[0] : maleCoeff[0];
	const coeff = isFemale ? femaleCoeff : maleCoeff;
	const maxbw = isFemale ? 150 : 210;
	const bw = Math.min(Math.max(bodyWeight, 40), maxbw);

	for (let i = 1; i < coeff.length; i++) {
		denominator += coeff[i] * Math.pow(bw, i);
	}

	const score: number = (500 / denominator) * total;
	return parseFloat(score.toFixed(2));
}

export const updateUserInfo = async (user: User, updatedInfo: Partial<UserInfo>): Promise<void> => {
	if (user) {
		try {
			const userDocRef = doc(db, 'users', user.uid);
			await updateDoc(userDocRef, {
				...updatedInfo,
				updatedAt: serverTimestamp()
			});
		} catch (error) {
			console.error('Error updating user info:', error);
			throw error;
		}
	}
};

// Function to create or update user document
export const createOrUpdateUser = async (
	user: User,
	userInfo: Partial<UserData>
): Promise<void> => {
	if (user) {
		try {
			const userDocRef = doc(db, 'users', user.uid);
			const userDoc = await getDoc(userDocRef);

			if (!userDoc.exists()) {
				// Create new user document
				await setDoc(userDocRef, {
					displayName: user.displayName || '',
					email: user.email || '',
					gender: userInfo.gender || 'Male',
					university: userInfo.university || '',
					userName: userInfo.userName || user.displayName || '',
					stats: {
						bestDots: 0,
						bestTotal: 0,
						lastLiftDate: null,
						totalLifts: 0
					},
					createdAt: serverTimestamp(),
					updatedAt: serverTimestamp(),
					...userInfo
				});
			} else {
				// Update existing user document
				await updateDoc(userDocRef, {
					...userInfo,
					updatedAt: serverTimestamp()
				});
			}
		} catch (error) {
			console.error('Error creating/updating user:', error);
			throw error;
		}
	}
};

// Function to submit a new lift
export const submitLift = async (
	user: User,
	squat: number,
	bench: number,
	deadlift: number,
	bodyWeight: number,
	age: number,
	gender: string,
	selectedUniversity: string,
	liftUID: string,
	liftType: string
): Promise<void> => {
	if (user) {
		const validateLift = (
			bodyWeight: number,
			lift: number,
			liftType: 'squat' | 'bench' | 'deadlift'
		): boolean => {
			const maxRatios = {
				squat: 5,
				bench: 2.5,
				deadlift: 5
			};
			return lift <= bodyWeight * maxRatios[liftType];
		};

		if (
			!validateLift(bodyWeight, squat, 'squat') ||
			!validateLift(bodyWeight, bench, 'bench') ||
			!validateLift(bodyWeight, deadlift, 'deadlift')
		) {
			throw new Error('Lift exceeds maximum allowed weight.');
		}

		if (get(weightUnit) === 'kg') {
			bodyWeight = bodyWeight * 2.205;
			squat = squat * 2.205;
			bench = bench * 2.205;
			deadlift = deadlift * 2.205;
		}

		try {
			const total: number = bench + squat + deadlift;
			const dotsScore: number = ageCoefCalc(age, Calculate_DOTS(bodyWeight, total, gender));

			// Create lift in user's subcollection
			const userLiftsRef = collection(db, 'users', user.uid, 'lifts');
			await addDoc(userLiftsRef, {
				squat,
				bench,
				deadlift,
				bodyWeight,
				gender,
				age,
				dotsScore,
				selectedUniversity,
				total,
				liftUID,
				liftType,
				displayName: user.displayName,
				timestamp: serverTimestamp()
			});

			// Update user stats
			const userDocRef = doc(db, 'users', user.uid);
			const userDoc = await getDoc(userDocRef);

			if (userDoc.exists()) {
				const userData = userDoc.data() as UserData;
				const newStats = {
					bestDots: Math.max(userData.stats?.bestDots || 0, dotsScore),
					bestTotal: Math.max(userData.stats?.bestTotal || 0, total),
					lastLiftDate: serverTimestamp(),
					totalLifts: (userData.stats?.totalLifts || 0) + 1
				};

				await updateDoc(userDocRef, {
					stats: newStats,
					updatedAt: serverTimestamp()
				});
			} else {
				// Create user document if it doesn't exist
				await setDoc(userDocRef, {
					displayName: user.displayName || '',
					email: user.email || '',
					gender: gender,
					university: selectedUniversity,
					userName: user.displayName || '',
					stats: {
						bestDots: dotsScore,
						bestTotal: total,
						lastLiftDate: serverTimestamp(),
						totalLifts: 1
					},
					createdAt: serverTimestamp(),
					updatedAt: serverTimestamp()
				});
			}
		} catch (error) {
			console.error('Error submitting lift:', error);
			throw error;
		}
	} else {
		throw new Error('User not authenticated');
	}
};

// Function to get all lifts (for leaderboard)
export const getAllLifts = (callback: (lifts: Lift[]) => void): (() => void) => {
	// Query all users
	const usersQuery = query(collection(db, 'users'));

	const unsubscribe = onSnapshot(usersQuery, async (usersSnapshot) => {
		// For each user, get their best lift
		const promises = usersSnapshot.docs.map(async (userDoc) => {
			const userId = userDoc.id;
			const userData = userDoc.data() as UserData;

			// Query user's lifts subcollection, ordered by DOTS score descending
			const liftsRef = collection(db, 'users', userId, 'lifts');
			const liftsQuery = query(liftsRef, orderBy('dotsScore', 'desc'), limit(1));

			try {
				const liftsSnapshot = await getDocs(liftsQuery);

				if (!liftsSnapshot.empty) {
					const bestLiftDoc = liftsSnapshot.docs[0];
					const bestLift = bestLiftDoc.data() as Lift;

					return {
						...bestLift,
						id: bestLiftDoc.id,
						userId,
						displayName: userData.displayName || bestLift.displayName,
						formattedDate: formatDate(bestLift.timestamp),
						selectedUniversity: bestLift.selectedUniversity || 'Not Specified'
					} as Lift;
				}
			} catch (error) {
				console.error(`Error fetching lifts for user ${userId}:`, error);
			}

			return null;
		});

		// Wait for all promises to resolve
		const results = await Promise.all(promises);

		// Filter out null results and sort by DOTS score
		const validLifts = results.filter((lift): lift is Lift => lift !== null);
		const sortedLifts = validLifts
			.sort((a, b) => b.dotsScore - a.dotsScore)
			.map((lift, index) => ({ ...lift, rank: index + 1 }));

		callback(sortedLifts);
	});

	return unsubscribe;
};

// Helper function to normalize university names for matching
function normalizeUniversityName(universityName: string): string {
	if (!universityName) return '';

	return (
		universityName
			.toLowerCase()
			.trim()
			// Remove common suffixes and campus designations
			.replace(
				/\s*-\s*(main\s+campus|ann\s+arbor|college\s+park|university\s+park|campus|main).*$/i,
				''
			)
			// Remove "the" at the beginning
			.replace(/^the\s+/i, '')
			// Remove common university type indicators at the end
			.replace(/\s+(university|college|institute|school)(\s+of.*)?$/i, '')
			// Normalize spacing
			.replace(/\s+/g, ' ')
			.trim()
	);
}

// Helper function to check if two university names should be considered the same
function universitiesMatch(university1: string, university2: string): boolean {
	if (!university1 || !university2) return false;

	// Exact match first
	if (university1 === university2) return true;

	// Normalize both names
	const normalized1 = normalizeUniversityName(university1);
	const normalized2 = normalizeUniversityName(university2);

	// Check if normalized names match
	if (normalized1 === normalized2) return true;

	// Check if one is a substring of the other (for cases like "Michigan" vs "University of Michigan")
	if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
		// Additional check to avoid false positives with very short names
		const minLength = Math.min(normalized1.length, normalized2.length);
		if (minLength >= 5) {
			// Only match if the shorter name is at least 5 characters
			return true;
		}
	}

	return false;
}

// Function to get lifts filtered by university (for university leaderboards)
export const getUniversityLifts = (
	university: string,
	callback: (lifts: Lift[]) => void
): (() => void) => {
	// Query all users
	const usersQuery = query(collection(db, 'users'));

	const unsubscribe = onSnapshot(usersQuery, async (usersSnapshot) => {
		// For each user, get their best lift that matches the university
		const promises = usersSnapshot.docs.map(async (userDoc) => {
			const userId = userDoc.id;
			const userData = userDoc.data() as UserData;

			// Query user's lifts subcollection (get all lifts, then filter in memory)
			const liftsRef = collection(db, 'users', userId, 'lifts');
			const liftsQuery = query(liftsRef, orderBy('dotsScore', 'desc'));

			try {
				const liftsSnapshot = await getDocs(liftsQuery);

				// Filter lifts by university using intelligent matching and get the best one
				const universityLifts = liftsSnapshot.docs
					.map((doc) => ({ ...(doc.data() as Lift), id: doc.id }))
					.filter((lift) => universitiesMatch(lift.selectedUniversity, university));

				if (universityLifts.length > 0) {
					// Get the best lift (first one since already ordered by dotsScore desc)
					const bestLift = universityLifts[0];

					return {
						...bestLift,
						userId,
						displayName: userData.displayName || bestLift.displayName,
						formattedDate: formatDate(bestLift.timestamp),
						selectedUniversity: bestLift.selectedUniversity || 'Not Specified'
					} as Lift;
				}
			} catch (error) {
				console.error(`Error fetching lifts for user ${userId}:`, error);
			}

			return null;
		});

		// Wait for all promises to resolve
		const results = await Promise.all(promises);

		// Filter out null results and sort by DOTS score
		const validLifts = results.filter((lift): lift is Lift => lift !== null);
		const sortedLifts = validLifts
			.sort((a, b) => b.dotsScore - a.dotsScore)
			.map((lift, index) => ({ ...lift, rank: index + 1 }));

		callback(sortedLifts);
	});

	return unsubscribe;
};

export const getUserName = async (displayName: string): Promise<string> => {
	const q = query(collection(db, 'users'), where('displayName', '==', displayName), limit(1));
	const querySnapshot = await getDocs(q);
	const userName = querySnapshot.docs[0]?.data().userName || '';
	return userName;
};

export const getUserInfo = (
	userId: string,
	callback: (userInfo: UserInfo | null) => void
): (() => void) => {
	const userDocRef = doc(db, 'users', userId);
	const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
		if (docSnapshot.exists()) {
			const data = docSnapshot.data() as UserData;
			callback({
				displayName: data.displayName,
				userName: data.userName || data.displayName,
				gender: data.gender,
				selectedUniversity: data.university || 'Not Specified'
			});
		} else {
			callback(null);
		}
	});
	return unsubscribe;
};

export const getUserLifts = (
	displayName: string,
	callback: (lifts: Lift[]) => void
): (() => void) => {
	// First find the user by displayName
	const q = query(collection(db, 'users'), where('displayName', '==', displayName), limit(1));

	const unsubscribe = onSnapshot(q, async (querySnapshot) => {
		if (!querySnapshot.empty) {
			const userDoc = querySnapshot.docs[0];
			const userId = userDoc.id;

			// Now get their lifts from subcollection
			const liftsRef = collection(db, 'users', userId, 'lifts');
			const liftsQuery = query(liftsRef, orderBy('timestamp', 'desc'));

			onSnapshot(liftsQuery, (liftsSnapshot) => {
				const lifts: Lift[] = liftsSnapshot.docs.map((doc) => ({
					...(doc.data() as Lift),
					id: doc.id,
					formattedDate: formatDate(doc.data().timestamp)
				}));
				callback(lifts);
			});
		} else {
			callback([]);
		}
	});

	return unsubscribe;
};

// Function to get lifts for a specific user (for personal dashboard)
export const getUserLiftsPersonal = (
	userId: string,
	callback: (lifts: Lift[]) => void
): (() => void) => {
	const liftsRef = collection(db, 'users', userId, 'lifts');
	const q = query(liftsRef, orderBy('timestamp', 'desc'));

	const unsubscribe = onSnapshot(
		q,
		(querySnapshot) => {
			const lifts: Lift[] = querySnapshot.docs.map((doc) => {
				const data = doc.data();

				// Normalize the data structure to ensure consistency
				const normalizedLift = {
					...(data as Lift),
					id: doc.id,
					formattedDate: formatDate(data.timestamp),
					// Ensure consistent field naming
					selectedUniversity: data.selectedUniversity || data.university || 'Not Specified',
					// Ensure all required numeric fields exist
					squat: data.squat || 0,
					bench: data.bench || 0,
					deadlift: data.deadlift || 0,
					total: data.total || (data.squat || 0) + (data.bench || 0) + (data.deadlift || 0),
					bodyWeight: data.bodyWeight || 0,
					dotsScore: data.dotsScore || 0,
					age: data.age || 0,
					// Ensure other required fields
					displayName: data.displayName || '',
					gender: data.gender || 'Male',
					liftType: data.liftType || 'Gym Lift',
					liftUID: data.liftUID || doc.id,
					userId: data.userId || userId,
					timestamp: data.timestamp
				};

				return normalizedLift;
			});

			callback(lifts);
		},
		(error) => {
			console.error('Error fetching user lifts:', error);
			callback([]);
		}
	);

	return unsubscribe;
};

// Helper function to format date
function formatDate(timestamp: { toDate: () => Date }): string {
	if (!timestamp) return '';
	const date = timestamp.toDate();
	return date.toLocaleDateString();
}

export const deleteLift = async (user: User, liftId: string): Promise<void> => {
	if (user && liftId) {
		try {
			// Delete from user's lifts subcollection
			const liftDocRef = doc(db, 'users', user.uid, 'lifts', liftId);
			await deleteDoc(liftDocRef);

			// Update user stats
			await updateUserStats(user.uid);
		} catch (error) {
			console.error('Error deleting lift:', error);
			throw error;
		}
	} else {
		console.error('User not authenticated or liftId is undefined');
		throw new Error('User not authenticated or liftId is undefined');
	}
};

export const updateLift = async (
	user: User,
	liftId: string,
	updatedLift: Partial<Lift>
): Promise<void> => {
	if (user) {
		try {
			// Calculate total and dots score
			const total: number =
				(updatedLift.squat ?? 0) + (updatedLift.bench ?? 0) + (updatedLift.deadlift ?? 0);
			const dotsScore: number = ageCoefCalc(
				updatedLift.age ?? 23,
				Calculate_DOTS(updatedLift.bodyWeight ?? 0, total, updatedLift.gender ?? 'Male')
			);

			const liftDocRef = doc(db, 'users', user.uid, 'lifts', liftId);
			await updateDoc(liftDocRef, {
				...updatedLift,
				total,
				dotsScore,
				timestamp: serverTimestamp()
			});

			// Update user stats
			await updateUserStats(user.uid);
		} catch (error) {
			console.error('Error updating lift:', error);
			throw error;
		}
	} else {
		console.error('User not authenticated');
		throw new Error('User not authenticated');
	}
};

// Helper function to update user stats
async function updateUserStats(userId: string): Promise<void> {
	try {
		const liftsRef = collection(db, 'users', userId, 'lifts');
		const liftsSnapshot = await getDocs(liftsRef);

		let bestDots = 0;
		let bestTotal = 0;
		let lastLiftDate: any = null;
		const totalLifts = liftsSnapshot.size;

		liftsSnapshot.docs.forEach((doc) => {
			const lift = doc.data();
			bestDots = Math.max(bestDots, lift.dotsScore || 0);
			bestTotal = Math.max(bestTotal, lift.total || 0);
			if (!lastLiftDate || (lift.timestamp && lift.timestamp > lastLiftDate)) {
				lastLiftDate = lift.timestamp;
			}
		});

		const userDocRef = doc(db, 'users', userId);
		await updateDoc(userDocRef, {
			stats: {
				bestDots,
				bestTotal,
				lastLiftDate,
				totalLifts
			},
			updatedAt: serverTimestamp()
		});
	} catch (error) {
		console.error('Error updating user stats:', error);
	}
}

export const searchPeople = async (searchQuery: string): Promise<any[]> => {
	const q = query(
		collection(db, 'users'),
		where('displayName', '>=', searchQuery),
		where('displayName', '<=', searchQuery + '\uf8ff'),
		limit(10)
	);

	const querySnapshot = await getDocs(q);
	return querySnapshot.docs.map((doc) => ({
		id: doc.id,
		name: doc.data().displayName
	}));
};
