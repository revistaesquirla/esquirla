'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { saveEditionPageCount } from '@/actions/editions';
import { cn, padIssue } from '@/lib/utils';

// El worker se copia a /public con el script postinstall: sin CDN, sin sorpresas.
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const ZOOM_STEPS = [0.75, 1, 1.25, 1.5, 2, 2.5];

export type PdfReaderProps = {
  fileUrl: string;
  title: string;
  issueNumber: number;
  year: number;
  editionId: string;
  knownPageCount: number | null;
  backHref: string;
};

export default function PdfReader({
  fileUrl,
  title,
  issueNumber,
  year,
  editionId,
  knownPageCount,
  backHref,
}: PdfReaderProps) {
  const [totalPages, setTotalPages] = useState<number | null>(knownPageCount);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomIndex, setZoomIndex] = useState(1);
  const [spread, setSpread] = useState(false);
  const [pageWidth, setPageWidth] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pageInput, setPageInput] = useState('1');

  const shellRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const zoom = ZOOM_STEPS[zoomIndex];
  const issue = padIssue(issueNumber);

  // ── Medidas: doble página en pantallas anchas, una sola en móvil ──
  useEffect(() => {
    const element = stageRef.current;
    if (!element) return;

    const measure = () => {
      const available = element.clientWidth - 32;
      const useSpread = window.innerWidth >= 1024;
      setSpread(useSpread);
      setPageWidth(Math.max(240, useSpread ? (available - 16) / 2 : available));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener('orientationchange', measure);

    return () => {
      observer.disconnect();
      window.removeEventListener('orientationchange', measure);
    };
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => setPageInput(String(currentPage)), [currentPage]);

  const step = spread ? 2 : 1;

  const goTo = useCallback(
    (page: number) => {
      if (!totalPages) return;
      const clamped = Math.min(Math.max(1, page), totalPages);
      setCurrentPage(clamped);
      stageRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [totalPages],
  );

  const next = useCallback(() => goTo(currentPage + step), [currentPage, goTo, step]);
  const previous = useCallback(() => goTo(currentPage - step), [currentPage, goTo, step]);

  // ── Teclado ──
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;

      if (event.key === 'ArrowRight' || event.key === 'PageDown') next();
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') previous();
      if (event.key === '+' || event.key === '=') setZoomIndex((i) => Math.min(i + 1, ZOOM_STEPS.length - 1));
      if (event.key === '-') setZoomIndex((i) => Math.max(i - 1, 0));
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [next, previous]);

  const onDocumentLoad = ({ numPages }: { numPages: number }) => {
    setTotalPages(numPages);
    setLoadError(null);
    if (!knownPageCount) void saveEditionPageCount(editionId, numPages);
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await shellRef.current?.requestFullscreen();
    } catch {
      // Algunos navegadores móviles no permiten pantalla completa. No es grave.
    }
  };

  const onTouchStart = (event: React.TouchEvent) => {
    if (event.touches.length !== 1) return;
    touchStartX.current = event.touches[0].clientX;
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 60) return;
    if (delta < 0) next();
    else previous();
  };

  const renderedWidth = pageWidth * zoom;
  const secondPage = spread && totalPages && currentPage + 1 <= totalPages ? currentPage + 1 : null;

  return (
    <div ref={shellRef} className="flex h-dvh flex-col bg-carbon text-paper">
      {/* ── Barra superior ── */}
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b-2 border-paper/20 px-4 py-3">
        <div className="min-w-0">
          <p className="dato text-rojo">
            Esquirla / {issue} · {year}
          </p>
          <h1 className="truncate font-mono text-sm uppercase tracking-[0.12em]">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <a href={fileUrl} download className="toolbtn" target="_blank" rel="noreferrer">
            Descargar
          </a>
          <button type="button" onClick={toggleFullscreen} className="toolbtn hidden sm:inline-flex">
            {isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          </button>
          <Link href={backHref} className="toolbtn">
            Cerrar
          </Link>
        </div>
      </header>

      {/* ── Páginas ── */}
      <div
        ref={stageRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="flex-1 overflow-auto overscroll-contain p-4"
        style={{ touchAction: 'pinch-zoom pan-y' }}
      >
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoad}
          onLoadError={() =>
            setLoadError('No se pudo cargar el PDF de esta edición. Inténtalo de nuevo más tarde.')
          }
          loading={<ReaderMessage>Cargando la edición…</ReaderMessage>}
          error={
            <ReaderMessage>
              No se pudo cargar el PDF de esta edición.
              <a href={fileUrl} className="mt-4 block underline" target="_blank" rel="noreferrer">
                Abrir el archivo directamente
              </a>
            </ReaderMessage>
          }
          noData={<ReaderMessage>Esta edición todavía no tiene un PDF.</ReaderMessage>}
          externalLinkTarget="_blank"
        >
          {pageWidth > 0 && !loadError ? (
            <div className="flex items-start justify-center gap-4">
              <PageFrame pageNumber={currentPage} width={renderedWidth} />
              {secondPage ? <PageFrame pageNumber={secondPage} width={renderedWidth} /> : null}
            </div>
          ) : null}
        </Document>
      </div>

      {/* ── Controles ── */}
      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t-2 border-paper/20 px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={previous}
            disabled={currentPage <= 1}
            className="toolbtn"
            aria-label="Página anterior"
          >
            ‹ Anterior
          </button>
          <button
            type="button"
            onClick={next}
            disabled={!totalPages || currentPage + step > totalPages}
            className="toolbtn"
            aria-label="Página siguiente"
          >
            Siguiente ›
          </button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            const value = Number(pageInput);
            if (Number.isFinite(value)) goTo(value);
          }}
          className="flex items-center gap-2"
        >
          <label htmlFor="ir-a-pagina" className="dato text-paper/60">
            Página
          </label>
          <input
            id="ir-a-pagina"
            type="number"
            min={1}
            max={totalPages ?? 1}
            value={pageInput}
            onChange={(event) => setPageInput(event.target.value)}
            className="w-16 border-2 border-paper/30 bg-transparent px-2 py-1 text-center font-mono text-sm"
          />
          <span className="dato text-paper/60">de {totalPages ?? '—'}</span>
        </form>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoomIndex((i) => Math.max(i - 1, 0))}
            disabled={zoomIndex === 0}
            className="toolbtn"
            aria-label="Reducir zoom"
          >
            −
          </button>
          <span className="dato w-12 text-center text-paper/60">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={() => setZoomIndex((i) => Math.min(i + 1, ZOOM_STEPS.length - 1))}
            disabled={zoomIndex === ZOOM_STEPS.length - 1}
            className="toolbtn"
            aria-label="Aumentar zoom"
          >
            +
          </button>
        </div>
      </footer>

      <style jsx global>{`
        .toolbtn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          border: 2px solid rgba(241, 237, 228, 0.35);
          padding: 0.45rem 0.8rem;
          font-family: var(--font-mono), monospace;
          font-size: 0.68rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          transition: background-color 0.15s ease;
        }
        .toolbtn:hover:not(:disabled) {
          background-color: var(--rojo);
          border-color: var(--rojo);
        }
        .toolbtn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
        .react-pdf__Page__textContent span::selection {
          background: var(--rojo);
        }
      `}</style>
    </div>
  );
}

function PageFrame({ pageNumber, width }: { pageNumber: number; width: number }) {
  return (
    <Page
      pageNumber={pageNumber}
      width={width}
      renderAnnotationLayer
      renderTextLayer
      className={cn('bg-paper shadow-[0_0_0_2px_rgba(241,237,228,0.25)]')}
      loading={
        <div
          className="grid place-items-center bg-paper/10"
          style={{ width, height: width * 1.414 }}
        >
          <span className="dato text-paper/50">Cargando página…</span>
        </div>
      }
    />
  );
}

function ReaderMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-[50vh] place-items-center px-6 text-center font-mono text-xs uppercase tracking-[0.16em] text-paper/60">
      <div>{children}</div>
    </div>
  );
}
