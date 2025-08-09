import React, { useMemo, useCallback } from 'react';
import { FaWhatsapp, FaFacebookF, FaTwitter, FaLinkedinIn } from 'react-icons/fa';
import { FiLink, FiShare2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const openInNewTab = (url) => {
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (newWindow) newWindow.opener = null;
};

const ShareButtons = ({
  title,
  description,
  image,
  url,
  className = '',
  onShare = null,
  size = 'md',
  showLabels = false,
}) => {
  const shareUrl = useMemo(() => {
    try {
      return url || window.location.href;
    } catch {
      return url || '';
    }
  }, [url]);

  const shareTitle = title || document.title || 'Check this out';
  const shareDescription = description || '';

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard');
      if (onShare) onShare('copy');
    } catch (e) {
      toast.error('Failed to copy link');
    }
  }, [shareUrl, onShare]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: shareUrl,
        });
        if (onShare) onShare('native');
      } catch {
        // user cancelled or not available
      }
    } else {
      handleCopy();
    }
  }, [shareTitle, shareDescription, shareUrl, onShare, handleCopy]);

  const sizes = {
    sm: {
      container: 'space-x-2',
      btn: 'p-2',
      icon: 'w-4 h-4',
      label: 'text-xs',
    },
    md: {
      container: 'space-x-2.5',
      btn: 'p-2.5',
      icon: 'w-4 h-4',
      label: 'text-sm',
    },
    lg: {
      container: 'space-x-3',
      btn: 'p-3',
      icon: 'w-5 h-5',
      label: 'text-sm',
    },
  }[size];

  const Button = ({ onClick, title, children, ariaLabel }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={ariaLabel || title}
      className={`inline-flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors ${sizes.btn}`}
    >
      {children}
    </button>
  );

  const onClickFactory = (network, url) => () => {
    openInNewTab(url);
    if (onShare) onShare(network);
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareTitle} - ${shareUrl}`)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareDescription}\n\n${shareUrl}`)}`;

  return (
    <div className={`flex items-center ${sizes.container} ${className}`}>
      <Button onClick={handleNativeShare} title="Share">
        <FiShare2 className={sizes.icon} />
      </Button>

      <Button onClick={onClickFactory('whatsapp', whatsappUrl)} title="Share on WhatsApp">
        <FaWhatsapp className={`${sizes.icon} text-[#25D366]`} />
      </Button>

      <Button onClick={onClickFactory('twitter', twitterUrl)} title="Share on X">
        <FaTwitter className={`${sizes.icon} text-[#1DA1F2]`} />
      </Button>

      <Button onClick={onClickFactory('facebook', facebookUrl)} title="Share on Facebook">
        <FaFacebookF className={`${sizes.icon} text-[#1877F2]`} />
      </Button>

      <Button onClick={onClickFactory('linkedin', linkedinUrl)} title="Share on LinkedIn">
        <FaLinkedinIn className={`${sizes.icon} text-[#0A66C2]`} />
      </Button>

      <Button onClick={onClickFactory('email', mailtoUrl)} title="Share via Email">
        <span className={`${sizes.label} font-medium`}>@</span>
      </Button>

      <Button onClick={handleCopy} title="Copy link">
        <FiLink className={sizes.icon} />
      </Button>

      {showLabels && (
        <span className={`text-gray-500 ${sizes.label}`}>Share</span>
      )}
    </div>
  );
};

export default ShareButtons;


