import { useCallback, useEffect, useRef, useState } from "react";

interface UseAutoGeolocationOptions {
  /** Gọi khi lấy được vị trí (dù là tự động hay do người dùng bấm nút). */
  onLocation: (latitude: number, longitude: number) => void;
  /** Gọi khi lấy vị trí thất bại. Không gọi cho các lần thử tự động (silent) để tránh làm phiền người dùng. */
  onError?: (message: string) => void;
  /** Chỉ bật cơ chế tự động lấy vị trí khi true (ví dụ: chỉ khi dialog/form đang mở). Mặc định true. */
  enabled?: boolean;
}

/**
 * Hook tự động lấy vị trí GPS của người dùng:
 * 1. Khi form được mở, nếu trình duyệt đã có sẵn quyền vị trí (hoặc chưa từng hỏi) thì tự động lấy vị trí ngay,
 *    không cần người dùng phải bấm nút "Lấy vị trí".
 * 2. Nếu người dùng CHƯA cấp quyền lúc mở form, hook sẽ lắng nghe sự kiện thay đổi quyền (Permissions API) —
 *    ngay khi người dùng cấp quyền GPS (ví dụ bật lại trong cài đặt trình duyệt), vị trí sẽ được tự động lấy lại.
 *
 * Vẫn trả về `fetchLocation` để dùng cho nút "Lấy vị trí hiện tại" (lấy lại thủ công, có thông báo lỗi rõ ràng).
 */
export function useAutoGeolocation({ onLocation, onError, enabled = true }: UseAutoGeolocationOptions) {
  const [locationLoading, setLocationLoading] = useState(false);
  const onLocationRef = useRef(onLocation);
  const onErrorRef = useRef(onError);
  onLocationRef.current = onLocation;
  onErrorRef.current = onError;

  const fetchLocation = useCallback((silent = false) => {
    if (!navigator.geolocation) {
      if (!silent) onErrorRef.current?.("Trình duyệt không hỗ trợ định vị");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationLoading(false);
        onLocationRef.current(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        setLocationLoading(false);
        if (!silent) onErrorRef.current?.(err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let permissionStatus: PermissionStatus | null = null;

    const handleChange = () => {
      if (permissionStatus?.state === "granted") {
        // Người dùng vừa cấp quyền GPS -> tự động lấy vị trí ngay
        fetchLocation(false);
      }
    };

    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((status) => {
          permissionStatus = status;
          if (status.state !== "denied") {
            // "granted": đã từng cho phép -> tự lấy vị trí ngay khi vào form
            // "prompt": chưa quyết định -> chủ động hỏi quyền khi tạo sự kiện (im lặng nếu người dùng từ chối)
            fetchLocation(true);
          }
          status.addEventListener("change", handleChange);
        })
        .catch(() => {
          fetchLocation(true);
        });
    } else {
      // Trình duyệt không hỗ trợ Permissions API -> vẫn thử lấy vị trí ngay
      fetchLocation(true);
    }

    return () => {
      permissionStatus?.removeEventListener("change", handleChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { locationLoading, fetchLocation };
}
