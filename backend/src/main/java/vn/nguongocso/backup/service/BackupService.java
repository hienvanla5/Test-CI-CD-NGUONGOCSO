package vn.nguongocso.backup.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import vn.nguongocso.auth.entity.User;
import vn.nguongocso.backup.dto.request.BackupScheduleRequest;
import vn.nguongocso.backup.dto.response.BackupHistoryResponse;
import vn.nguongocso.backup.dto.response.BackupScheduleResponse;
import vn.nguongocso.backup.entity.BackupRestoreHistory;
import vn.nguongocso.backup.enums.BackupOperationType;
import vn.nguongocso.backup.enums.BackupStatus;
import vn.nguongocso.backup.enums.BackupType;

import java.io.File;

public interface BackupService {

    BackupScheduleResponse configureSchedule(BackupScheduleRequest request, User updater);

    BackupScheduleResponse getActiveSchedule();

    BackupHistoryResponse triggerManualBackup(User creator);

    BackupRestoreHistory executeBackup(BackupType backupType, User creator);

    BackupRestoreHistory executeBackupWithoutLock(BackupType backupType, User creator);

    void updateStatus(Integer id, BackupStatus status, String fileName, String filePath, Long fileSize, String errorMessage);

    Page<BackupHistoryResponse> getHistory(BackupOperationType operationType, BackupStatus status, Pageable pageable);

    File getBackupFile(Integer historyId);

    void deleteBackup(Integer historyId);
}
