export type DatabaseConnection = {
  /**
    Close the connection.

    @param force - Force close, emitting no events
   */
  close(force?: boolean): Promise<void>;
  drop(): Promise<void>;
};
