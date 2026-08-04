package vn.nguongocso.backup.service;

import vn.nguongocso.auth.entity.User;
import vn.nguongocso.backup.dto.response.BackupHistoryResponse;
import vn.nguongocso.backup.enums.BackupStatus;

public interface RestoreService {

    BackupHistoryResponse triggerRestore(Integer backupHistoryId, User creator);

    boolean isMaintenanceMode();

    void setMaintenanceMode(boolean mode);

    void updateStatus(Integer id, BackupStatus status, String errorMessage);
}
