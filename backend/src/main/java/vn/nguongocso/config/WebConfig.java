package vn.nguongocso.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer{

	@Value("${qr.image.storage.path:./files/qr}")
	private String qrStoragePath;
	
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/files/qr/**")
                .addResourceLocations("file:" + qrStoragePath + "/");
    }
}
