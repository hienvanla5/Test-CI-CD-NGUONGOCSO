package vn.nguongocso.auth.service.impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import vn.nguongocso.auth.constant.RoleCode;
import vn.nguongocso.auth.dto.request.CreateOrganizationRequest;
import vn.nguongocso.auth.dto.response.OrganizationResponse;
import vn.nguongocso.auth.entity.Organization;
import vn.nguongocso.auth.entity.OrganizationUser;
import vn.nguongocso.auth.entity.Role;
import vn.nguongocso.auth.entity.User;
import vn.nguongocso.auth.enums.OrganizationStatus;
import vn.nguongocso.auth.enums.OrganizationType;
import vn.nguongocso.auth.enums.OrganizationUserStatus;
import vn.nguongocso.auth.enums.UserStatus;
import vn.nguongocso.auth.repository.OrganizationRepository;
import vn.nguongocso.auth.repository.OrganizationUserRepository;
import vn.nguongocso.auth.repository.RoleRepository;
import vn.nguongocso.auth.repository.UserRepository;
import vn.nguongocso.auth.service.OrganizationService;

@Service
public class OrganizationServiceImpl implements OrganizationService {

	private final OrganizationRepository organizationRepository;
	private final UserRepository userRepository;
	private final RoleRepository roleRepository;
	private final OrganizationUserRepository organizationUserRepository;
	private final PasswordEncoder passwordEncoder;
	
    public OrganizationServiceImpl(OrganizationRepository organizationRepository,
            UserRepository userRepository, RoleRepository roleRepository,
            OrganizationUserRepository organizationUserRepository,
            PasswordEncoder passwordEncoder) {
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.organizationUserRepository = organizationUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public OrganizationResponse createOrganization(CreateOrganizationRequest request) {
        validateRequest(request);

        // 1. Tạo tổ chức
        Organization organization = new Organization();
        organization.setName(request.getOrganizationName());
        organization.setCode(request.getOrganizationCode());
        organization.setType(request.getOrganizationType());
        organization.setStatus(OrganizationStatus.ACTIVE);
        organization.setAddress(request.getAddress());
        organization.setPhone(request.getPhone());
        organization.setEmail(request.getEmail());
        organization = organizationRepository.save(organization);

        // 2. Tạo tài khoản quản lý ban đầu
        User manager = new User();
        manager.setUserName(request.getUserName());
        manager.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        manager.setFullName(request.getFullName());
        manager.setPhone(request.getManagerPhone());
        manager.setEmail(request.getManagerEmail());
        manager.setStatus(UserStatus.ACTIVE);
        manager = userRepository.save(manager);

     // 3. Gắn user vào tổ chức với vai trò quản lý — theo loại tổ chức
        Role managerRole = getDefaultRole(organization.getType());
        OrganizationUser link = new OrganizationUser();
        link.setOrganization(organization);
        link.setUser(manager);
        link.setRole(managerRole);
        link.setStatus(OrganizationUserStatus.ACTIVE);
        organizationUserRepository.save(link);

        return toResponse(organization);
    }

	private void validateRequest(CreateOrganizationRequest request) {

		if (organizationRepository.existsByCode(request.getOrganizationCode())) {
			throw new RuntimeException("Organization code already exists.");
		}

		if (userRepository.existsByUserName(request.getUserName())) {
			throw new RuntimeException("Username already exists.");
		}

		if (userRepository.existsByEmail(request.getManagerEmail())) {
			throw new RuntimeException("Email already exists.");
		}

	}
	
	private String resolveManagerRoleCode(OrganizationType type) {
	    return switch (type) {
	        case COOPERATIVE -> RoleCode.ORG_MANAGER;   // VT-02
	        case ENTERPRISE  -> RoleCode.PROCUREMENT;   // VT-04
	        case GOVERNMENT  -> RoleCode.REGULATOR;     // VT-05
	    };
	}

	private Role getDefaultRole(OrganizationType type) {
	    String code = resolveManagerRoleCode(type);
	    return roleRepository.findByCode(code)
	            .orElseThrow(() -> new RuntimeException("Default role not found: " + code));
	}
	
    private OrganizationResponse toResponse(Organization organization) {
        return new OrganizationResponse(
                organization.getOrganizationId(),
                organization.getName(),
                organization.getCode(),
                organization.getType(),
                organization.getStatus(),
                organization.getCreatedAt());
    }
	
}