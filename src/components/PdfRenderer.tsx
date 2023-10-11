'use client';

import {
  ChevronDown,
  ChevronUp,
  Loader,
  Loader2,
  RotateCw,
  Search,
} from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useToast } from './ui/use-toast';
import { useResizeDetector } from 'react-resize-detector';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import SimpleBar from 'simplebar-react';
import PdfFullScreen from './PdfFullScreen';

interface PdfRendererProps {
  url: string;
}

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PdfRenderer = ({ url }: PdfRendererProps) => {
  const { toast } = useToast();
  const { width, ref } = useResizeDetector();

  const [noOfPages, setNoOfPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [renderedScale, setRenderedScale] = useState<number | null>(null);
  const isLoading = renderedScale !== scale;

  const CustomPagevalidator = z.object({
    page: z
      .string()
      .refine((num) => Number(num) > 0 && Number(num) <= noOfPages!),
  });

  type PageValidatorType = z.infer<typeof CustomPagevalidator>;
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PageValidatorType>({
    defaultValues: {
      page: '1',
    },
    resolver: zodResolver(CustomPagevalidator),
  });

  const handlePageSubmit = ({ page }: PageValidatorType) => {
    setPageNumber(Number(page));
    setValue('page', String(page));
  };

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">
          <Button
            disabled={pageNumber <= 1}
            aria-label="previous page"
            variant={'ghost'}
            onClick={() => {
              setPageNumber((prev) => (prev - 1 > 1 ? prev - 1 : 1));
              setValue('page', String(pageNumber - 1));
            }}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1.5">
            <Input
              {...register('page')}
              className={cn(
                'w-12 h-8',
                errors.page && 'focus-visible:ring-red-500',
              )}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit(handlePageSubmit)();
                }
              }}
            />
            <p className="text-zinc-700 text-sm space-x-1 flex items-center justify-center">
              <span>/</span>
              <span>
                {noOfPages ?? <Loader2 className="h-4 w-4 animate-spin" />}
              </span>
            </p>
          </div>
          <Button
            disabled={pageNumber === undefined || pageNumber === noOfPages}
            aria-label="next page"
            variant={'ghost'}
            onClick={() => {
              setPageNumber((prev) =>
                prev + 1 < noOfPages! ? prev + 1 : prev,
              );
              setValue('page', String(pageNumber + 1));
            }}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>

        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-label="zoom" variant={'ghost'} className="gap-1.5">
                <Search className="h-4 w-4" />
                {scale * 100}%<ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setScale(0.5)}>
                50%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(0.75)}>
                75%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(1)}>
                100%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(1.5)}>
                150%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2)}>
                200%
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button aria-label="rotate 90 degrees" variant="ghost">
            <RotateCw
              className="h-4 w-4"
              onClick={() => setRotation((prev) => prev + 90)}
            />
          </Button>

          <PdfFullScreen url={url} />
        </div>
      </div>

      <div className="flex-1 w-full max-h-screen">
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
          <div ref={ref}>
            <Document
              loading={
                <div className="flex justify-center">
                  <Loader2 className="my-32 h-6 w-6 animate-spin" />
                </div>
              }
              onLoadError={() => {
                return toast({
                  title: 'Error loading PDF',
                  description: 'Please try again later',
                  variant: 'destructive',
                });
              }}
              className="max-h-full"
              file={url}
              onLoadSuccess={({ numPages }) => {
                setNoOfPages(numPages);
              }}
            >
              {isLoading && renderedScale ? (
                <Page
                  pageNumber={pageNumber}
                  width={width ? width : 1}
                  scale={scale}
                  rotate={rotation}
                  key={'@' + renderedScale}
                />
              ) : null}
              <Page
                className={cn(isLoading ? 'hidden' : '')}
                pageNumber={pageNumber}
                width={width ? width : 1}
                scale={scale}
                rotate={rotation}
                key={'@' + scale}
                loading={
                  <div className="flex justify-center">
                    <Loader2 className="my-32 h-6 w-6 animate-spin" />
                  </div>
                }
                onRenderSuccess={() => setRenderedScale(scale)}
              />
            </Document>
          </div>
        </SimpleBar>
      </div>
    </div>
  );
};

export default PdfRenderer;
