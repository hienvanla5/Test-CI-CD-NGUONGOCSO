package vn.nguongocso.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import vn.nguongocso.auth.service.CustomUserDetails;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtTokenProvider {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration}")
    private long jwtExpirationMs;

    public SecretKey getKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(userDetails.getUsername())
                .claim("userID", userDetails.getUserId().toString())
                .claim("orgId", userDetails.getOrganizationId().toString())
                .claim("orgCode", userDetails.getOrganizationCode())
                .claim("role", userDetails.getRoleCode())
                .claim("fullName", userDetails.getFullName())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getKey())
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String getUsernameFromToken(String token) {
        return parseToken(token).getSubject();
    }

    public UUID getUserIdFromToken(String token) {
        return UUID.fromString(parseToken(token).get("userID", String.class));
    }

    public UUID getOrganizationIdFromToken(String token) {
        return UUID.fromString(parseToken(token).get("orgId", String.class));
    }

    public String getOrganizationCodeFromToken(String token) {
        return parseToken(token).get("orgCode", String.class);
    }

    public String getRoleCodeFromToken(String token) {
        return parseToken(token).get("role", String.class);
    }

    public Long getExpirationInSeconds() {

        return jwtExpirationMs / 1000;
    }
}
