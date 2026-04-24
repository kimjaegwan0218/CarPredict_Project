package com.example.nachajung.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.car-dir}")
    private String carDir;

    @Value("${app.upload.damage-dir}")
    private String damageDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String carLocation = Paths.get(carDir).toUri().toString();
        String damageLocation = Paths.get(damageDir).toUri().toString();

        registry.addResourceHandler("/uploads/car/**")
                .addResourceLocations(carLocation);

        registry.addResourceHandler("/uploads/damage/**")
                .addResourceLocations(damageLocation);
    }
}