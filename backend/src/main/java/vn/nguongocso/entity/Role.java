package vn.nguongocso.entity;

import vn.nguongocso.enums.RoleName;

public class Role {
	private int roleID;
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
