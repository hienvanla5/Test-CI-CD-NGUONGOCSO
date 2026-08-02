import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  getPublicCertifications,
  getPublicTrace,
} from '@/api/publicApi';
import type { PublicTraceResponse } from '@/types/publicTrace';
import type { PublicLotCertificationsResponse } from '@/types/publicCertification';
import { ProductInfo } from '@/components/public/ProductInfo';
import { RecallAlert } from '@/components/public/RecallAlert';
import { Timeline } from '@/components/public/Timeline';
import { RouteMap } from '@/components/public/RouteMap';
import { ProductFeedbackForm } from '@/components/public/ProductFeedbackForm';
import { PublicCertificationsSection } from '@/components/public/PublicCertificationsSection';
import {
  AlertCircle,
  Home,
  List,
  LoaderCircle,
  MapPin,
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

export default function TraceLookupPage() {
  const { codeValue } = useParams<{ codeValue: string }>();

  const [data, setData] = useState<PublicTraceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [certificationData, setCertificationData] =
    useState<PublicLotCertificationsResponse | null>(null);
  const [certificationLoading, setCertificationLoading] = useState(true);
  const [certificationError, setCertificationError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!codeValue) {
      setError('Mã tra cứu không hợp lệ.');
      setLoading(false);
      setCertificationLoading(false);
      return;
    }

    const fetchTrace = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await getPublicTrace(codeValue);
        setData(result);
      } catch (err: any) {
        const message =
          err.response?.data?.message ||
          'Không thể tra cứu thông tin.';

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    const fetchCertifications = async () => {
      try {
        setCertificationLoading(true);
        setCertificationError(null);

        const result = await getPublicCertifications(codeValue);
        setCertificationData(result);
      } catch (err: any) {
        // 404 hoặc 501: backend chưa triển khai endpoint chứng nhận công khai
        // → không hiển thị lỗi cho người dùng, chỉ ẩn section
        const status = err.response?.status;
        if (status === 404 || status === 501) {
          setCertificationError(null);
          setCertificationData(null);
        } else {
          const message =
            err.response?.data?.message ||
            'Không thể tải thông tin chứng nhận.';
          setCertificationError(message);
          setCertificationData(null);
        }
      } finally {
        setCertificationLoading(false);
      }
    };

    fetchTrace();
    fetchCertifications();
  }, [codeValue]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-emerald-600" />

          <p className="mt-4 text-gray-600">
            Đang tra cứu thông tin...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-xl bg-white p-6 text-center shadow-sm">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />

          <h2 className="mt-4 text-xl font-bold text-gray-900">
            Không tìm thấy
          </h2>

          <p className="mt-2 text-gray-600">
            {error}
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 font-medium text-emerald-600 hover:text-emerald-700"
          >
            <Home className="h-4 w-4" />
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const hasLocationData = data.events.some(
    (event) =>
      event.latitude !== null &&
      event.longitude !== null
  );

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="flex items-center justify-center gap-2 text-2xl font-bold text-emerald-700">
            <span className="text-3xl">🌾</span>
            Nguồn gốc số
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Tra cứu hành trình sản phẩm
          </p>
        </div>

        {/* Mã tra cứu */}
        <div className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
          <span className="text-xs uppercase tracking-wider text-gray-400">
            Mã tra cứu
          </span>

          <p className="break-all font-mono text-lg font-semibold text-gray-800">
            {data.codeValue}
          </p>
        </div>

        {/* Thông tin sản phẩm */}
        <ProductInfo
          productName={data.productName}
          shipmentCode={data.shipmentCode}
          status={data.shipmentStatus}
        />

        {/* Cảnh báo thu hồi */}
        {data.recalled && data.recallMessage && (
          <RecallAlert message={data.recallMessage} />
        )}

        {/* Chứng nhận công khai */}
        <PublicCertificationsSection
          data={certificationData}
          isLoading={certificationLoading}
          error={certificationError}
        />

        {/* Gửi phản ánh */}
        {data.productionLotId && (
          <ProductFeedbackForm
            productionLotId={data.productionLotId}
            productName={data.productName}
          />
        )}

        {/* Bản đồ và danh sách sự kiện */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <Tabs
            defaultValue={hasLocationData ? 'map' : 'list'}
            className="w-full"
          >
            <TabsList className="h-auto w-full justify-start rounded-none border-b bg-gray-50/50 p-0">
              <TabsTrigger
                value="map"
                disabled={!hasLocationData}
                className="flex items-center gap-2 rounded-none px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 data-[state=active]:bg-transparent"
              >
                <MapPin className="h-4 w-4" />
                Bản đồ

                {!hasLocationData && (
                  <span className="text-xs font-normal text-gray-400">
                    (không có dữ liệu)
                  </span>
                )}
              </TabsTrigger>

              <TabsTrigger
                value="list"
                className="flex items-center gap-2 rounded-none px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 data-[state=active]:bg-transparent"
              >
                <List className="h-4 w-4" />
                Danh sách sự kiện
              </TabsTrigger>
            </TabsList>

            <TabsContent value="map" className="p-0">
              <RouteMap events={data.events} />
            </TabsContent>

            <TabsContent value="list" className="p-4">
              <Timeline events={data.events} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 py-4 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Nguồn gốc số. Thông tin chỉ mang
          tính tham khảo.
        </div>
      </div>
    </div>
  );
}