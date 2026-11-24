package com.medicare.platform.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ClientIpResolverTest {

    @Test
    @DisplayName("Ignore X-Forwarded-For quand le proxy n'est pas déclaré de confiance")
    void shouldIgnoreForwardedHeaderByDefault() {
        ClientIpResolver resolver = new ClientIpResolver(false);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("192.168.1.10");
        request.addHeader("X-Forwarded-For", "1.2.3.4");

        assertEquals("192.168.1.10", resolver.resolve(request));
    }

    @Test
    @DisplayName("Utilise la première IP de X-Forwarded-For derrière un proxy de confiance")
    void shouldUseForwardedHeaderWhenTrusted() {
        ClientIpResolver resolver = new ClientIpResolver(true);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("127.0.0.1");
        request.addHeader("X-Forwarded-For", "1.2.3.4, 10.0.0.1");

        assertEquals("1.2.3.4", resolver.resolve(request));
    }
}
