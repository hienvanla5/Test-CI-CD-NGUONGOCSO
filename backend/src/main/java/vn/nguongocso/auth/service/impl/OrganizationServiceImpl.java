package vn.nguongocso.auth.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.auth.service.OrganizationService;
import vn.nguongocso.exception.BusinessException;

/**
 * Service xử lý nghiệp vụ liên quan đến tổ chức.
 */
@Slf4j
@Service
public class OrganizationServiceImpl implements OrganizationService {

	private final OrganizationRepository organizationRepository;
	private final UserRepository userRepository;
	private final RoleRepository roleRepository;
	private final OrganizationUserRepository organizationUserRepository;
	private final PasswordEncoder passwordEncoder;

	public OrganizationServiceImpl(OrganizationRepository organizationRepository, UserRepository userRepository,
			RoleRepository roleRepository, OrganizationUserRepository organizationUserRepository,
			PasswordEncoder passwordEncoder) {
		this.organizationRepository = organizationRepository;
		this.userRepository = userRepository;
		this.roleRepository = roleRepository;
		this.organizationUserRepository = organizationUserRepository;
		this.passwordEncoder = passwordEncoder;
	}
	
	/**
	 * Tạo mới một tổ chức cùng tài khoản quản lý mặc định.
	 *
	 * @param request thông tin tổ chức và tài khoản quản lý
	 * @return thông tin tổ chức sau khi tạo
	 */
	@Override
	@Transactional
	public OrganizationResponse createOrganization(CreateOrganizationRequest request) {

		log.info("Bắt đầu tạo organization với code={}", request.getOrganizationCode());

		Organization organization = createOrganizationEntity(request);
		User manager = createManager(request);

		log.debug("Đã tạo Organization id={}", organization.getOrganizationId());
		log.debug("Đã tạo User username={}", manager.getUserName());

		assignManagerRole(organization, manager);

		log.info("Tạo organization thành công. organizationId={}, manager={}", organization.getOrganizationId(),
				manager.getUserName());

		return toResponse(organization);
	}

	private Organization createOrganizationEntity(CreateOrganizationRequest request) {

		log.debug("Đang lưu organization {}", request.getOrganizationCode());
		Organization organization = new Organization();

		organization.setName(request.getOrganizationName());
		organization.setCode(request.getOrganizationCode());
		organization.setType(request.getOrganizationType());
		organization.setStatus(OrganizationStatus.ACTIVE);
		organization.setAddress(request.getAddress());
		organization.setPhone(request.getPhone());
		organization.setEmail(request.getEmail());

		Organization saved = organizationRepository.save(organization);
		log.debug("Đã lưu organization id={}", saved.getOrganizationId());

		return saved;
	}

	private User createManager(CreateOrganizationRequest request) {

		log.debug("Đang tạo tài khoản quản lý {}", request.getUserName());
		User manager = new User();

		manager.setUserName(request.getUserName());
		manager.setPasswordHash(passwordEncoder.encode(request.getPassword()));
		manager.setFullName(request.getFullName());
		manager.setPhone(request.getManagerPhone());
		manager.setEmail(request.getManagerEmail());
		manager.setStatus(UserStatus.ACTIVE);

		User saved = userRepository.save(manager);
		log.debug("Đã tạo user id={}", saved.getUserId());

		return saved;
	}

	private void assignManagerRole(Organization organization, User manager) {

		Role role = getDefaultRole(organization.getType());
		log.debug("Gán role {} cho user {} trong organization {}", role.getCode(), manager.getUserName(),
				organization.getCode());

		OrganizationUser link = new OrganizationUser();
		link.setOrganization(organization);
		link.setUser(manager);
		link.setRole(role);
		link.setStatus(OrganizationUserStatus.ACTIVE);

		organizationUserRepository.save(link);
		log.debug("Đã lưu OrganizationUser");
	}

	private String resolveManagerRoleCode(OrganizationType type) {
	    return switch (type) {
	        case SYSTEM      -> RoleCode.ADMIN;
	        case COOPERATIVE -> RoleCode.ORG_MANAGER;   // VT-02
	        case ENTERPRISE  -> RoleCode.PROCUREMENT;   // VT-04
	        case GOVERNMENT  -> RoleCode.REGULATOR;     // VT-05

	    };
	}

	private Role getDefaultRole(OrganizationType type) {
		String code = resolveManagerRoleCode(type);
		log.debug("Tìm role mặc định với code={}", code);

		return roleRepository.findByCode(code).orElseThrow(() -> {
			log.error("Không tìm thấy role mặc định với code={}", code);
			return new RuntimeException("Default role not found: " + code);
		});
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