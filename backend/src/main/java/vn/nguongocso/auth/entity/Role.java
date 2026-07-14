package vn.nguongocso.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import vn.nguongocso.auth.enums.RoleName;

@Entity
@Table(name = "Role")
public class Role {
	
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int roleID;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    private RoleName role;

	public Role(int roleID, RoleName role) {
		super();
		this.roleID = roleID;
		this.role = role;
	}

	public Role() {
		super();
	}

	public int getRoleID() {
		return roleID;
	}

	public void setRoleID(int roleID) {
		this.roleID = roleID;
	}

	public RoleName getRole() {
		return role;
	}

	public void setRole(RoleName role) {
		this.role = role;
	}
}
