package vn.nguongocso.permission.service;

public interface PermissionChecker {

    /**
     * Kiểm tra người dùng hiện tại có quyền thực hiện action
     * trên resource hay không.
     *
     * @param resource tên module
     * @param action   CREATE / READ / UPDATE / DELETE ...
     */
    void check(String resource, String action);

}