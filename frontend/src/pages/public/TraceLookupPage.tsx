import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicTrace } from '@/api/publicApi';
import type { PublicTraceResponse } from '@/types/publicTrace';
import { ProductInfo } from '@/components/public/ProductInfo';
import { RecallAlert } from '@/components/public/RecallAlert';
import { Timeline } from '@/components/public/Timeline';
import { LoaderCircle, AlertCircle, Home } from 'lucide-react';

export default function TraceLookupPage() {
  const { codeValue } = useParams<{ codeValue: string }>();
  const [data, setData] = useState<PublicTraceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!codeValue) {
      setError('Mã tra cứu không hợp lệ.');
      setLoading(false);
      return;
    }

    const fetchTrace = async () => {
      try {
        const result = await getPublicTrace(codeValue);
        setData(result);
        setError(null);
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Không thể tra cứu thông tin.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchTrace();
  }, [codeValue]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoaderCircle className="h-12 w-12 animate-spin text-emerald-600 mx-auto" />
          <p className="mt-4 text-gray-600">Đang tra cứu thông tin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">Không tìm thấy</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
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

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Logo / Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-emerald-700 flex items-center justify-center gap-2">
            <span className="text-3xl">🌾</span> Nguồn gốc số
          </h1>
          <p className="text-sm text-gray-500 mt-1">Tra cứu hành trình sản phẩm</p>
        </div>

        {/* Mã tra cứu */}
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-gray-100">
          <span className="text-xs uppercase tracking-wider text-gray-400">Mã tra cứu</span>
          <p className="font-mono text-lg font-semibold text-gray-800 break-all">{data.codeValue}</p>
        </div>

        {/* Thông tin sản phẩm */}
        <ProductInfo
          productName={data.productName}
          shipmentCode={data.shipmentCode}
          status={data.shipmentStatus}
        />

        {/* Cảnh báo thu hồi (nếu có) */}
        {data.recalled && data.recallMessage && (
          <RecallAlert message={data.recallMessage} />
        )}

        {/* Timeline */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hành trình sản phẩm</h2>
          <Timeline events={data.events} />
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 py-4 border-t border-gray-200">
          © {new Date().getFullYear()} Nguồn gốc số. Thông tin chỉ mang tính tham khảo.
        </div>
      </div>
    </div>
  );
}