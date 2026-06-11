package com.microsaas.invoice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class InvoicePlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(InvoicePlatformApplication.class, args);
    }

}
