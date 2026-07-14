package vn.nguongocso.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import vn.nguongocso.auth.entity.OrganizationUser;
import vn.nguongocso.auth.entity.Role;
import vn.nguongocso.auth.entity.User;
import vn.nguongocso.auth.repository.OrganizationRepository;
import vn.nguongocso.auth.repository.RoleRepository;
import vn.nguongocso.auth.repository.UserRepository;
import vn.nguongocso.exception.BusinessException;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationUserRepository;
    private final RoleRepository roleRepository;

    public UserDetails loadUserByUsernameAndOrg(String username, String orgCode) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        OrganizationUser orgUser;
        if (orgCode != null && !orgCode.isEmpty()) {
            orgUser = organizationUserRepository.findByUserAndOrganizationCode(user, orgCode)
                    .orElseThrow(() -> new BusinessException("User not belong to organization: " + orgCode));
        } else {
            orgUser = organizationUserRepository.findFirstByUser(user)
                    .orElseThrow(() -> new BusinessException("User has no organization"));
        }

        Role role = roleRepository.findById(orgUser.getRole().getRoleID())
                .orElseThrow(() -> new BusinessException("Role not found"));

        return new CustomUserDetails(user, orgUser, role);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        throw new UnsupportedOperationException("Use loadUserByUsernameAndOrg instead");
    }
}