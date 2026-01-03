export type PlayniteSynchronizationResult = {
  success: boolean;
  reason: string;
  reason_code: "game_not_found" | "success" | "integrity_check_failed";
};

export type PlayniteSyncService = {
  /**
   * Synchronizes games media files
   */
  handleMediaFilesSynchronizationRequest: (
    request: Request
  ) => Promise<PlayniteSynchronizationResult>;
};
