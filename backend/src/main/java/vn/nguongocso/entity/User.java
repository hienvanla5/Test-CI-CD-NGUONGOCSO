package vn.nguongocso.entity;

import vn.nguongocso.enums.UserStatus;

public class User {

    private int userID;
    private String userName;
    private String passwordHash;
    private String name;
    private UserStatus status;
    private Organization organization;
    private Role role;

	public User(int userID, String userName, String passwordHash, String name, UserStatus status,
			Organization organization, Role role) {
		super();
		this.userID = userID;
		this.userName = userName;
		this.passwordHash = passwordHash;
		this.name = name;
		this.status = status;
		this.organization = organization;
		this.role = role;
	}
	
	public User() {
		super();
	}

	public int getUserID() {
		return userID;
	}

	public void setUserID(int userID) {
		this.userID = userID;
	}

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public String getPasswordHash() {
		return passwordHash;
	}

	public void setPasswordHash(String passwordHash) {
		this.passwordHash = passwordHash;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public UserStatus getStatus() {
		return status;
	}

	public void setStatus(UserStatus status) {
		this.status = status;
	}

	public Organization getOrganization() {
		return organization;
	}

	public void setOrganization(Organization organization) {
		this.organization = organization;
	}

	public Role getRole() {
		return role;
	}

	public void setRole(Role role) {
		this.role = role;
	}
    
    
}
