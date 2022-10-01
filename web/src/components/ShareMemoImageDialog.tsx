import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { userService } from "../services";
import toImage from "../labs/html2image";
import { ANIMATION_DURATION } from "../helpers/consts";
import * as utils from "../helpers/utils";
import Icon from "./Icon";
import { generateDialog } from "./Dialog";
import MemoContent from "./MemoContent";
import "../less/share-memo-image-dialog.less";

interface Props extends DialogProps {
  memo: Memo;
}

const ShareMemoImageDialog: React.FC<Props> = (props: Props) => {
  const { memo: propsMemo, destroy } = props;
  const { t } = useTranslation();
  const { user: userinfo } = userService.getState();
  const [shortcutImgUrl, setShortcutImgUrl] = useState("");
  const memo = {
    ...propsMemo,
    createdAtStr: utils.getDateTimeString(propsMemo.createdTs),
  };
  const memoElRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      if (!memoElRef.current) {
        return;
      }

      toImage(memoElRef.current, {
        backgroundColor: "#eaeaea",
        pixelRatio: window.devicePixelRatio * 2,
      })
        .then((url) => {
          setShortcutImgUrl(url);
        })
        .catch((err) => {
          console.error(err);
        });
    }, ANIMATION_DURATION);
  }, []);

  const handleCloseBtnClick = () => {
    destroy();
  };

  const handleDownloadBtnClick = () => {
    const a = document.createElement("a");
    a.href = shortcutImgUrl;
    a.download = `memos-${utils.getDateTimeString(Date.now())}.png`;
    a.click();
  };

  return (
    <>
      <div className="dialog-header-container">
        <p className="title-text">
          <span className="icon-text">🌄</span>
          {t("common.share")} Memo
        </p>
        <button className="btn close-btn" onClick={handleCloseBtnClick}>
          <Icon.X className="icon-img" />
        </button>
      </div>
      <div className="dialog-content-container">
        <div className={`tip-words-container ${shortcutImgUrl ? "finish" : "loading"}`}>
          <p className="tip-text">{shortcutImgUrl ? "Click to save the image 👇" : "Generating the screenshot..."}</p>
        </div>
        <div className="memo-container" ref={memoElRef}>
          {shortcutImgUrl !== "" && <img className="memo-shortcut-img" onClick={handleDownloadBtnClick} src={shortcutImgUrl} />}
          <span className="time-text">{memo.createdAtStr}</span>
          <MemoContent className="memo-content-wrapper" content={memo.content} displayConfig={{ enableExpand: false }} />
          <div className="watermark-container">
            <span className="normal-text">
              <span className="icon-text">✍️</span> by <span className="name-text">{userinfo?.name}</span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default function showShareMemoImageDialog(memo: Memo): void {
  generateDialog(
    {
      className: "share-memo-image-dialog",
    },
    ShareMemoImageDialog,
    { memo }
  );
}
