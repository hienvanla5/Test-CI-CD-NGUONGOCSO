package vn.nguongocso.organization.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.nguongocso.alert.event.ActivityLogEvent;
import vn.nguongocso.auth.entity.Role;
import vn.nguongocso.auth.entity.User;
import vn.nguongocso.auth.enums.UserStatus;
import vn.nguongocso.auth.repository.RoleRepository;
import vn.nguongocso.auth.repository.UserRepository;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.exception.BusinessException;
import vn.nguongocso.exception.DuplicateResourceException;
import vn.nguongocso.exception.ResourceNotFoundException;
import vn.nguongocso.organization.dto.request.AcceptInvitationRequest;
import vn.nguongocso.organization.dto.request.CreateInvitationRequest;
import vn.nguongocso.organization.dto.response.AcceptInvitationResponse;
import vn.nguongocso.organization.dto.response.InvitationPublicResponse;
import vn.nguongocso.organization.dto.response.InvitationResponse;
import vn.nguongocso.organization.entity.Invitation;
import vn.nguongocso.organization.entity.Organization;
import vn.nguongocso.organization.entity.OrganizationUser;
import vn.nguongocso.organization.enums.InvitationStatus;
import vn.nguongocso.organization.enums.OrganizationUserStatus;
import vn.nguongocso.organization.repository.InvitationRepository;
import vn.nguongocso.organization.repository.OrganizationRepository;
import vn.nguongocso.organization.repository.OrganizationUserRepository;
import vn.nguongocso.organization.service.InvitationService;

@Slf4j
@Service
public class InvitationServiceImpl implements InvitationService {

    private final InvitationRepository invitationRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final OrganizationUserRepository organizationUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventPublisher;

    public InvitationServiceImpl(
            InvitationRepository invitationRepository,
            OrganizationRepository organizationRepository,
            UserRepository userRepository,
            RoleRepository roleRepository,
            OrganizationUserRepository organizationUserRepository,
            PasswordEncoder passwordEncoder,
            ApplicationEventPublisher eventPublisher
    ) {
        this.invitationRepository = invitationRepository;
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.organizationUserRepository = organizationUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.eventPublisher = eventPublisher;
    }

    @Override
    @Transactional
    public InvitationResponse createInvitation(CreateInvitationRequest request, CustomUserDetails currentUser) {
        UUID orgId = currentUser.getOrganizationId();
        if (orgId == null) {
            throw new BusinessException("Người dùng không thuộc tổ chức nào");
        }

        Organization organization = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Tổ chức không tồn tại"));

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vai trò không tồn tại trong hệ thống"));

        // Kiểm tra xem email được mời đã là thành viên ACTIVE trong tổ chức chưa
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            organizationUserRepository.findByOrganization_OrganizationIdAndUser_UserId(orgId, user.getUserId())
                    .ifPresent(orgUser -> {
                        if (orgUser.getStatus() == OrganizationUserStatus.ACTIVE) {
                            throw new DuplicateResourceException("Người dùng có email này đã là thành viên của tổ chức");
                        }
                    });
        });

        // Vô hiệu hóa tất cả thư mời cũ có trạng thái PENDING của email này trong tổ chức
        List<Invitation> oldInvitations = invitationRepository
                .findByEmailAndOrganizationOrganizationIdAndStatus(
                        request.getEmail(), orgId, InvitationStatus.PENDING
                );
        if (!oldInvitations.isEmpty()) {
            for (Invitation oldInv : oldInvitations) {
                oldInv.setStatus(InvitationStatus.EXPIRED);
            }
            invitationRepository.saveAll(oldInvitations);
            log.info("Đã vô hiệu hóa {} thư mời cũ cho email={}", oldInvitations.size(), request.getEmail());
        }

        // Tạo thư mời mới
        String token = UUID.randomUUID().toString().replace("-", "");
        Invitation invitation = Invitation.builder()
                .organization(organization)
                .email(request.getEmail())
                .role(role)
                .token(token)
                .status(InvitationStatus.PENDING)
                .expiryDate(LocalDateTime.now().plusDays(request.getExpiryDays()))
                .createdBy(currentUser.getUser())
                .build();

        invitationRepository.save(invitation);

        // Mô phỏng gửi email
        log.info("📧 [MAIL SIMULATION] Gửi thư mời tới email {}. Link: http://localhost:5173/join?token={}", 
                request.getEmail(), token);

        // Ghi Audit Log
        eventPublisher.publishEvent(ActivityLogEvent.builder()
                .userId(currentUser.getUserId())
                .username(currentUser.getUsername())
                .fullName(currentUser.getFullName())
                .organizationId(orgId)
                .action("CREATE")
                .description("Người dùng " + currentUser.getUsername() + " đã gửi thư mời tham gia tổ chức cho email " + request.getEmail() + " với vai trò " + role.getName())
                .entityType("MEMBER_INVITATION")
                .entityId(invitation.getId().toString())
                .timestamp(LocalDateTime.now())
                .build());

        return InvitationResponse.builder()
                .id(invitation.getId())
                .email(invitation.getEmail())
                .organizationId(organization.getOrganizationId())
                .organizationName(organization.getName())
                .roleId(role.getRoleId())
                .roleName(role.getName())
                .status(invitation.getStatus().name())
                .token(invitation.getToken())
                .expiryDate(invitation.getExpiryDate())
                .createdBy(currentUser.getUserId())
                .createdAt(invitation.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public InvitationPublicResponse getInvitationDetails(String token) {
        Invitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Thư mời không tồn tại hoặc mã token không hợp lệ"));

        // Lazy update nếu thư mời quá hạn
        if (invitation.getStatus() == InvitationStatus.PENDING && invitation.getExpiryDate().isBefore(LocalDateTime.now())) {
            invitation.setStatus(InvitationStatus.EXPIRED);
            invitationRepository.save(invitation);
            log.info("Lazy update: Thư mời token={} đã chuyển sang EXPIRED", token);
        }

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new BusinessException("Thư mời đã quá hạn hoặc đã được sử dụng");
        }

        return InvitationPublicResponse.builder()
                .email(invitation.getEmail())
                .organizationName(invitation.getOrganization().getName())
                .roleName(invitation.getRole().getName())
                .status(invitation.getStatus().name())
                .expiryDate(invitation.getExpiryDate())
                .build();
    }

    @Override
    @Transactional
    public AcceptInvitationResponse acceptInvitation(String token, AcceptInvitationRequest request) {
        Invitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Thư mời không tồn tại hoặc mã token không hợp lệ"));

        // Lazy update nếu thư mời quá hạn
        if (invitation.getStatus() == InvitationStatus.PENDING && invitation.getExpiryDate().isBefore(LocalDateTime.now())) {
            invitation.setStatus(InvitationStatus.EXPIRED);
            invitationRepository.save(invitation);
            log.info("Lazy update: Thư mời token={} đã chuyển sang EXPIRED khi cố gắng chấp nhận", token);
        }

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new BusinessException("Thư mời đã quá hạn hoặc đã được sử dụng");
        }

        if (userRepository.existsByUserName(request.getUserName())) {
            throw new DuplicateResourceException("Tên đăng nhập đã tồn tại trong hệ thống");
        }

        // Tạo User mới
        User user = User.builder()
                .userName(request.getUserName())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .email(invitation.getEmail())
                .status(UserStatus.ACTIVE)
                .build();

        userRepository.save(user);

        // Tạo liên kết OrganizationUser
        OrganizationUser orgUser = new OrganizationUser();
        orgUser.setOrganization(invitation.getOrganization());
        orgUser.setUser(user);
        orgUser.setRole(invitation.getRole());
        orgUser.setStatus(OrganizationUserStatus.ACTIVE);

        organizationUserRepository.save(orgUser);

        // Cập nhật thư mời
        invitation.setStatus(InvitationStatus.ACCEPTED);
        invitation.setUsedAt(LocalDateTime.now());
        invitationRepository.save(invitation);

        // Ghi Audit Log
        eventPublisher.publishEvent(ActivityLogEvent.builder()
                .userId(user.getUserId())
                .username(user.getUserName())
                .fullName(user.getFullName())
                .organizationId(invitation.getOrganization().getOrganizationId())
                .action("ACCEPT")
                .description("Người dùng " + user.getUserName() + " chấp nhận thư mời tham gia tổ chức bằng email " + invitation.getEmail())
                .entityType("MEMBER_INVITATION")
                .entityId(invitation.getId().toString())
                .timestamp(LocalDateTime.now())
                .build());

        log.info("Thành viên mới tham gia tổ chức thành công: username={}, organization={}", 
                user.getUserName(), invitation.getOrganization().getName());

        return AcceptInvitationResponse.builder()
                .userId(user.getUserId())
                .userName(user.getUserName())
                .fullName(user.getFullName())
                .organizationId(invitation.getOrganization().getOrganizationId())
                .organizationName(invitation.getOrganization().getName())
                .roleCode(invitation.getRole().getCode())
                .build();
    }
}
