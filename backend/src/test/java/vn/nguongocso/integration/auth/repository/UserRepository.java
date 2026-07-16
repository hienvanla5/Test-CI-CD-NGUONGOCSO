package vn.nguongocso.integration.auth.repository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import vn.nguongocso.auth.entity.User;
import vn.nguongocso.auth.enums.UserStatus;
import vn.nguongocso.auth.repository.UserRepository;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")   // Kích hoạt profile test
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldSaveAndFindUserByUsername() {
        User user = new User();
        user.setUserId(UUID.randomUUID());
        user.setUserName("test_user");
        user.setPasswordHash("encoded");
        user.setFullName("Test User");
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);

        Optional<User> found = userRepository.findByUserName("test_user");
        assertThat(found).isPresent();
        assertThat(found.get().getFullName()).isEqualTo("Test User");
    }
}