package vn.nguongocso.entity;

import vn.nguongocso.enums.OrganizationStatus;
import vn.nguongocso.enums.OrganizationType;

public class Organization {

    private int organizationID;
    private String name;
    private OrganizationType type;
    private OrganizationStatus status;
    
	public Organization(int organizationID, String name, OrganizationType type, OrganizationStatus status) {
		super();
		this.organizationID = organizationID;
		this.name = name;
		this.type = type;
		this.status = status;
	}

	public Organization() {
		super();
	}

	public int getOrganizationID() {
		return organizationID;
	}

	public void setOrganizationID(int organizationID) {
		this.organizationID = organizationID;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public OrganizationType getType() {
		return type;
	}

	public void setType(OrganizationType type) {
		this.type = type;
	}

	public OrganizationStatus getStatus() {
		return status;
	}

	public void setStatus(OrganizationStatus status) {
		this.status = status;
	}
    
    
}
