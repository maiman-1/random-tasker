export interface RandomTaskerState {
	currentTaskName: string | null;
    currentTaskPath: string | null;
    savedRewards?: string[]; // Optional: Store rewards for completed tasks
    savedPunishments?: string[]; // Optional: Store punishments for incomplete tasks
}
