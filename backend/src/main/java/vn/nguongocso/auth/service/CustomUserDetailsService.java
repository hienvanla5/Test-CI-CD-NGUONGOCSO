package vn.nguongocso.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import vn.nguongocso.auth.entity.Role;
import vn.nguongocso.auth.entity.User;
import vn.nguongocso.auth.repository.RoleRepository;
import vn.nguongocso.auth.repository.UserRepository;
import vn.nguongocso.exception.BusinessException;
import vn.nguongocso.organization.entity.OrganizationUser;
import vn.nguongocso.organization.repository.OrganizationUserRepository;

/**
 * Custom implementation of {@link UserDetailsService} that authenticates
 * users in the context of an organization.
 *
 * <p>Unlike the default Spring Security implementation, this service
 * requires both the username and organization code to identify the
 * correct organization membership and associated role.</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final OrganizationUserRepository organizationUserRepository;
    private final RoleRepository roleRepository;

    /**
     * Loads a user by username and organization code.
     *
     * <p>The returned {@link UserDetails} contains both the user's
     * identity and the role assigned within the specified organization.</p>
     *
     * @param username user's login name
     * @param orgCode organization code; if {@code null} or empty, the
     *                user's first organization membership is used
     * @return authenticated user details
     * @throws UsernameNotFoundException if the user does not exist
     * @throws BusinessException if the user does not belong to the
     *                           specified organization or the role
     *                           cannot be resolved
     */
    public UserDetails loadUserByUsernameAndOrg(String username, String orgCode) {

        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng"));

        OrganizationUser orgUser;

        if (orgCode != null && !orgCode.isEmpty()) {
            orgUser = organizationUserRepository.findByUserAndOrganization_Code(user, orgCode)
                    .orElseThrow(() -> new BusinessException(
                            "Người dùng không thuộc tổ chức có mã: " + orgCode));
        } else {
            orgUser = organizationUserRepository.findFirstByUser(user)
                    .orElseThrow(() -> new BusinessException(
                            "Người dùng chưa được gán vào tổ chức nào"));
        }
        log.info("Found organization: {}", orgUser.getOrganization().getCode());

        Role role = roleRepository.findById(orgUser.getRole().getRoleId())
                .orElseThrow(() -> new BusinessException(
                        "Không tìm thấy vai trò của người dùng"));

        return new CustomUserDetails(user, orgUser, role);
    }

    /**
     * Not supported by this application.
     *
     * <p>This system authenticates users by both username and
     * organization code. Calling this method would be ambiguous because
     * the same user may belong to multiple organizations with different
     * roles.</p>
     *
     * <p>Use {@link #loadUserByUsernameAndOrg(String, String)} instead.</p>
     *
     * @param username ignored
     * @return never returns normally
     * @throws UnsupportedOperationException always
     */
    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        throw new UnsupportedOperationException(
                "Vui lòng sử dụng phương thức loadUserByUsernameAndOrg()");
    }
}