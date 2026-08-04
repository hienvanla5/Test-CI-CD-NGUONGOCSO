import { useEffect, useState } from 'react';
import { Eye, Download, Trash2, Upload, File, Image, FileText, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getAttachments, uploadAttachment, deleteAttachment } from '@/api/attachmentApi';
import type { Attachment } from '@/types/attachment';
import { format } from "date-fns";

interface AttachmentManagerProps {
  logId: string;
  onUpdate?: (logId: string, action: 'upload' | 'delete') => void;
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return <Image className="h-4 w-4 text-purple-500" />;
  if (mimeType === 'application/pdf') return <FileText className="h-4 w-4 text-red-500" />;
  if (mimeType.startsWith('video/')) return <Video className="h-4 w-4 text-blue-500" />;
  return <File className="h-4 w-4 text-muted-foreground" />;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
};

const formatDate = (dateStr: string) => {
  try {
    return format(new Date(dateStr), 'dd/MM/yyyy HH:mm');
  } catch {
    return dateStr;
  }
};

export function AttachmentManager({ logId, onUpdate }: AttachmentManagerProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');

  const loadAttachments = async () => {
    if (!logId) return;
    try {
      setIsLoading(true);
      const data = await getAttachments(logId);
      setAttachments(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải chứng từ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (logId) loadAttachments();
  }, [logId]);

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Vui lòng chọn file');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Chỉ hỗ trợ JPG, PNG, PDF');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File vượt quá 5MB');
      return;
    }

    try {
      setIsUploading(true);
      await uploadAttachment(logId, selectedFile, description || undefined);
      toast.success('Tải lên thành công');
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setDescription('');
      await loadAttachments();
      onUpdate?.(logId, 'upload');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Tải lên thất bại');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa chứng từ này?')) return;
    try {
      await deleteAttachment(id);
      toast.success('Xóa thành công');
      await loadAttachments();
      onUpdate?.(logId, 'delete'); // ✅ Đã sửa
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xóa thất bại');
    }
  };

  if (isLoading) return <div className="py-2 text-sm text-muted-foreground">Đang tải chứng từ...</div>;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Chứng từ đính kèm ({attachments.length})</span>
        <Button variant="create" size="sm" onClick={() => setUploadDialogOpen(true)}>
          <Upload className="mr-2 h-3 w-3" /> Tải lên
        </Button>
      </div>

      {attachments.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2 text-center">Chưa có chứng từ</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên file</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Kích thước</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Người tải</TableHead>
                <TableHead>Ngày tải</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attachments.map((att) => (
                <TableRow key={att.id}>
                  <TableCell className="flex items-center gap-2">
                    {getFileIcon(att.fileType)}
                    <span className="truncate max-w-[150px]">{att.fileName}</span>
                  </TableCell>
                  <TableCell>{att.fileType}</TableCell>
                  <TableCell>{formatFileSize(att.fileSize)}</TableCell>
                  <TableCell>{att.description || '—'}</TableCell>
                  <TableCell>{att.uploadedBy}</TableCell>
                  <TableCell>{formatDate(att.uploadedAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="view" size="icon" onClick={() => window.open(att.fileUrl, '_blank')}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => window.open(att.fileUrl, '_blank')}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="delete" size="icon" onClick={() => handleDelete(att.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tải lên chứng từ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="file">Chọn file *</Label>
              <Input
                id="file"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground mt-1">Hỗ trợ JPG, PNG, PDF (≤5MB)</p>
            </div>
            <div>
              <Label htmlFor="desc">Mô tả (tùy chọn)</Label>
              <Input
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả ngắn"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Hủy</Button>
            <Button variant="create" onClick={handleUpload} disabled={isUploading}>
              {isUploading ? 'Đang tải...' : 'Tải lên'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}