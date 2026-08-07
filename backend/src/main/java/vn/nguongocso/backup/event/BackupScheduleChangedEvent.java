package vn.nguongocso.backup.event;

import org.springframework.context.ApplicationEvent;
import vn.nguongocso.backup.entity.BackupSchedule;

/**
 * Sự kiện được phát ra khi lịch trình sao lưu thay đổi.
 */
public class BackupScheduleChangedEvent extends ApplicationEvent {

    private final BackupSchedule schedule;

    /**
     * Tạo một sự kiện BackupScheduleChangedEvent mới.
     */
    public BackupScheduleChangedEvent(Object source, BackupSchedule schedule) {
        super(source);
        this.schedule = schedule;
    }

    public BackupSchedule getSchedule() {
        return schedule;
    }
}
