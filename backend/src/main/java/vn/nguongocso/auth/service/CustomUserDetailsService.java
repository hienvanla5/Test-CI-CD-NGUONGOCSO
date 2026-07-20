package vn.nguongocso.auth.service;

import lombok.RequiredArgsConstructor;
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

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final OrganizationUserRepository organizationUserRepository;
    private final RoleRepository roleRepository;

    public UserDetails loadUserByUsernameAndOrg(String username, String orgCode) {

        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng"));

        OrganizationUser orgUser;

        if (orgCode != null && !orgCode.isEmpty()) {
            orgUser = organizationUserRepository.findByUserAndOrganizationCode(user, orgCode)
                    .orElseThrow(() -> new BusinessException(
                            "Người dùng không thuộc tổ chức có mã: " + orgCode));
        } else {
            orgUser = organizationUserRepository.findFirstByUser(user)
                    .orElseThrow(() -> new BusinessException(
                            "Người dùng chưa được gán vào tổ chức nào"));
        }

        Role role = roleRepository.findById(orgUser.getRole().getRoleId())
                .orElseThrow(() -> new BusinessException(
                        "Không tìm thấy vai trò của người dùng"));

        return new CustomUserDetails(user, orgUser, role);
    }

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        throw new UnsupportedOperationException(
                "Vui lòng sử dụng phương thức loadUserByUsernameAndOrg()");
    }
}