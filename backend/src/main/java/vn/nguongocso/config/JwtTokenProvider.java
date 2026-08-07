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

/**
 * Provides utility methods for generating, parsing and validating JWT tokens.
 *
 * <p>The generated JWT contains authentication and organization-related
 * information that will be used for authorization in subsequent requests.</p>
 */
@Component
public class JwtTokenProvider {
    private static final String CLAIM_USER_ID = "userId";
    private static final String CLAIM_ORG_ID = "orgId";
    private static final String CLAIM_ORG_NAME = "orgName";
    private static final String CLAIM_ORG_CODE = "orgCode";
    private static final String CLAIM_ROLE = "role";
    private static final String CLAIM_FULL_NAME = "fullName";

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration}")
    private long jwtExpirationMs;

    /**
     * Creates the secret key used to sign and verify JWT tokens.
     *
     * @return HMAC secret key derived from the configured application secret
     */
    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Generates a signed JWT for the authenticated user.
     *
     * <p>The token contains user identity and organization information
     * required by the application.</p>
     *
     * @param authentication authenticated user
     * @return signed JWT string
     */
    public String generateToken(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(userDetails.getUsername())
                .claim(CLAIM_USER_ID, userDetails.getUserId().toString())
                .claim(CLAIM_ORG_ID, userDetails.getOrganizationId().toString())
                .claim(CLAIM_ORG_NAME, userDetails.getOrganizationName())
                .claim(CLAIM_ORG_CODE, userDetails.getOrganizationCode())
                .claim(CLAIM_ROLE, userDetails.getRoleCode())
                .claim(CLAIM_FULL_NAME, userDetails.getFullName())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getKey())
                .compact();
    }

    /**
     * Parses and verifies a JWT token.
     *
     * @param token JWT string
     * @return parsed JWT claims
     * @throws io.jsonwebtoken.JwtException if the token is invalid
     */
    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Validates a JWT token.
     *
     * <p>The token is considered valid if it is correctly signed,
     * well-formed and has not expired.</p>
     *
     * @param token JWT string
     * @return {@code true} if the token is valid; {@code false} otherwise
     */
    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Extracts the username from a JWT token.
     *
     * @param token JWT string
     * @return username stored in the token
     */
    public String getUsernameFromToken(String token) {
        return parseToken(token).getSubject();
    }

    /**
     * Extracts the user identifier from a JWT token.
     *
     * @param token JWT string
     * @return user identifier
     */
    public UUID getUserIdFromToken(String token) {
        return UUID.fromString(
                parseToken(token).get(CLAIM_USER_ID, String.class));
    }

    /**
     * Extracts the organization identifier from a JWT token.
     *
     * @param token JWT string
     * @return organization identifier
     */
    public UUID getOrganizationIdFromToken(String token) {
        return UUID.fromString(
                parseToken(token).get(CLAIM_ORG_ID, String.class));
    }

    /**
     * Extracts the organization code from a JWT token.
     *
     * @param token JWT string
     * @return organization code
     */
    public String getOrganizationCodeFromToken(String token) {
        return parseToken(token).get(CLAIM_ORG_CODE, String.class);
    }

    /**
     * Extracts the user's role code from a JWT token.
     *
     * @param token JWT string
     * @return role code
     */
    public String getRoleCodeFromToken(String token) {
        return parseToken(token).get(CLAIM_ROLE, String.class);
    }

    /**
     * Returns the configured JWT expiration time.
     *
     * @return token expiration time in seconds
     */
    public long getExpirationInSeconds() {

        return jwtExpirationMs / 1000;
    }
}
