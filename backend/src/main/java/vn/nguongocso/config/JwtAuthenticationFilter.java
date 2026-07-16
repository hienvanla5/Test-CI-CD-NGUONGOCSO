package vn.nguongocso.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import vn.nguongocso.auth.service.CustomUserDetailsService;

import java.io.IOException;

/**
 * JWT authentication filter executed once for every HTTP request.
 *
 * <p>This filter extracts the JWT from the Authorization header,
 * validates it, loads the corresponding user, and stores the
 * authenticated principal in the Spring Security context.</p>
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService userDetailsService;

    /**
     * Authenticates the incoming request using the JWT contained
     * in the Authorization header.
     *
     * @param request HTTP request
     * @param response HTTP response
     * @param filterChain remaining filter chain
     * @throws ServletException if servlet processing fails
     * @throws IOException if I/O processing fails
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String token = getTokenFromRequest(request);

        if (token != null && tokenProvider.validateToken(token)) {
            String username = tokenProvider.getUsernameFromToken(token);
            String orgCode = tokenProvider.getOrganizationCodeFromToken(token);

            UserDetails userDetails = userDetailsService.loadUserByUsernameAndOrg(username, orgCode);
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extracts the JWT from the Authorization header.
     *
     * <p>The expected header format is:</p>
     *
     * <pre>
     * Authorization: Bearer &lt;jwt-token&gt;
     * </pre>
     *
     * @param request HTTP request
     * @return JWT string if present; otherwise {@code null}
     */
    private String getTokenFromRequest(HttpServletRequest request) {
        String bearer = request.getHeader(AUTHORIZATION_HEADER);
        if (bearer != null && bearer.startsWith(BEARER_PREFIX)) {
            return bearer.substring(BEARER_PREFIX.length());
        }
        return null;
    }
}
