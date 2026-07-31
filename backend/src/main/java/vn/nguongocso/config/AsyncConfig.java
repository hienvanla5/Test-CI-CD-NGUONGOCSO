package vn.nguongocso.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

@Configuration
@EnableAsync
public class AsyncConfig {
    // Không cần thêm gì nếu bạn dùng executor mặc định
    // Có thể tùy chỉnh Executor nếu cần
}