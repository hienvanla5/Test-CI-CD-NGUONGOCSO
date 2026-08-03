package vn.nguongocso.backup.event;

import org.springframework.context.ApplicationEvent;
import vn.nguongocso.backup.entity.BackupSchedule;

public class BackupScheduleChangedEvent extends ApplicationEvent {
    private final BackupSchedule schedule;

    public BackupScheduleChangedEvent(Object source, BackupSchedule schedule) {
        super(source);
        this.schedule = schedule;
    }

    public BackupSchedule getSchedule() {
        return schedule;
    }
}
