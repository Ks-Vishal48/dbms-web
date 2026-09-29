package edu.nitt.dbmslab;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class DbmsLabApplication {
  public static void main(String[] args) { SpringApplication.run(DbmsLabApplication.class, args); }

  @Bean
  WebServerFactoryCustomizer<TomcatServletWebServerFactory> tomcatNio2() {
    return factory -> factory.setProtocol("org.apache.coyote.http11.Http11Nio2Protocol");
  }
}
