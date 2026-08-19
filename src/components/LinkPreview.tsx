import React, { useState, useEffect } from "react";
import { Globe, ExternalLink, Loader2 } from "lucide-react";

// In-memory cache to store metadata of fetched URLs for the active session
const previewCache: Record<string, {
  title: string;
  description: string;
  image: string;
  url: string;
  loaded: boolean;
  error?: boolean;
}> = {};

const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

interface LinkPreviewCardProps {
  url: string;
  isMe: boolean;
}

export const LinkPreviewCard: React.FC<LinkPreviewCardProps> = ({ url, isMe }) => {
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    // Check if cached
    if (previewCache[url]) {
      setMetadata(previewCache[url]);
      return;
    }

    const fetchMetadata = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
        if (!response.ok) throw new Error("Fetch failed");
        const data = await response.json();
        
        const result = {
          title: data.title || new URL(url).hostname,
          description: data.description || "",
          image: data.image || "",
          url: data.url || url,
          loaded: true
        };

        if (active) {
          previewCache[url] = result;
          setMetadata(result);
        }
      } catch (err) {
        console.error("Error fetching preview details:", err);
        let hostname = url;
        try {
          hostname = new URL(url).hostname;
        } catch (_) {}

        const fallback = {
          title: hostname,
          description: "",
          image: "",
          url,
          loaded: true,
          error: true
        };

        if (active) {
          previewCache[url] = fallback;
          setMetadata(fallback);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchMetadata();

    return () => {
      active = false;
    };
  }, [url]);

  if (loading) {
    return (
      <div className={`mt-2 flex items-center gap-2 p-2 rounded-xl text-[10px] ${
        isMe ? "bg-white/10 text-white/80" : "bg-zinc-950/50 text-zinc-400 border border-zinc-800/80"
      } animate-pulse max-w-[280px]`}>
        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF3D00]" />
        <span>جاري جلب معاينة الرابط...</span>
      </div>
    );
  }

  if (!metadata || !metadata.title) return null;

  const hostname = (() => {
    try {
      return new URL(metadata.url).hostname.replace("www.", "");
    } catch (_) {
      return "";
    }
  })();

  return (
    <a
      href={metadata.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`mt-2 block rounded-xl overflow-hidden shadow-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] max-w-[280px] border ${
        isMe 
          ? "bg-black/30 border-white/10 hover:bg-black/40 text-white" 
          : "bg-zinc-950 border-zinc-800/80 hover:border-zinc-700 text-zinc-100"
      }`}
    >
      <div className="flex gap-2 p-2.5 items-center">
        {metadata.image ? (
          <img
            src={metadata.image}
            alt={metadata.title}
            referrerPolicy="no-referrer"
            className="w-14 h-14 rounded-lg object-cover bg-zinc-900 shrink-0 border border-white/5"
            onError={(e) => {
              // Hide image if failed to load
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-zinc-900 shrink-0 flex items-center justify-center text-zinc-500 border border-white/5">
            <Globe className="w-5 h-5 text-[#FF3D00]/70" />
          </div>
        )}
        
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <h4 className="text-[11px] font-black leading-snug truncate text-[#FF3D00] flex items-center gap-1">
            <span>{metadata.title}</span>
            <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-65" />
          </h4>
          {metadata.description && (
            <p className="text-[9px] opacity-75 truncate mt-0.5 leading-normal">
              {metadata.description}
            </p>
          )}
          {hostname && (
            <span className="text-[7.5px] font-mono opacity-50 tracking-wide mt-1 block uppercase">
              {hostname}
            </span>
          )}
        </div>
      </div>
    </a>
  );
};

interface LinkPreviewMessageProps {
  text: string;
  isMe: boolean;
}

export const LinkPreviewMessage: React.FC<LinkPreviewMessageProps> = ({ text, isMe }) => {
  // Extract all links
  const matches = text.match(URL_REGEX);
  const uniqueUrls = matches ? Array.from(new Set(matches)) : [];

  if (uniqueUrls.length === 0) {
    return <>{text}</>;
  }

  // Parse text into mixed array of texts and styled links
  const parts = text.split(URL_REGEX);

  return (
    <div className="flex flex-col">
      <div className="break-words whitespace-pre-wrap leading-relaxed">
        {parts.map((part, index) => {
          if (part.match(URL_REGEX)) {
            return (
              <a
                key={index}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className={`underline break-all font-black ${
                  isMe ? "text-amber-300 hover:text-white" : "text-sky-400 hover:text-[#FF3D00]"
                }`}
                onClick={(e) => e.stopPropagation()} // Prevent bubble triggers
              >
                {part}
              </a>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </div>

      {/* Render previews under the bubble content */}
      <div className="flex flex-col gap-1.5 mt-1">
        {uniqueUrls.map((url, index) => (
          <LinkPreviewCard key={index} url={url} isMe={isMe} />
        ))}
      </div>
    </div>
  );
};
