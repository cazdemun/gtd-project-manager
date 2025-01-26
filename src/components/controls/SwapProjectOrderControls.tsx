import React from 'react';
import { ProjectActor } from "@/app/resources";
import BaseControl from "./BaseControl";
import { AiOutlineCaretDown, AiOutlineCaretUp } from 'react-icons/ai';
import { BiSolidArrowToBottom, BiSolidArrowToTop } from 'react-icons/bi';

type SwapDirection = 'up' | 'down' | 'top' | 'bottom';

type SwapProjectOrderControlsProps = BaseProjectControlProps<{
  orderInfos: OrderInfo[];
}>;


// TODO: move to top/bottom must shift all other projects instead of just swapping with the top/bottom project
const _getTargetIndex = (currentOrderInfo: OrderInfo, orderInfos: OrderInfo[], direction: SwapDirection): number | undefined => {
  if (direction === 'top') return 0;
  if (direction === 'bottom') return orderInfos.reduce((acc, item) => Math.max(acc, item.index), 0);
  return direction === 'up' ? currentOrderInfo.index - 1 : currentOrderInfo.index + 1;
};

const _swapPosition = (project: Project, orderInfos: OrderInfo[], direction: SwapDirection) => {
  const currentOrderInfo = orderInfos.find((item) => item._id === project._id);
  if (currentOrderInfo === undefined || currentOrderInfo.order === undefined) return;

  const targetIndex = _getTargetIndex(currentOrderInfo, orderInfos, direction);
  const targetOrderInfo = orderInfos.find((item) => item.index === targetIndex);
  if (targetOrderInfo === undefined || targetOrderInfo.order === undefined) return;

  if (targetOrderInfo.order === currentOrderInfo.order) return; // for bottom and top cases

  ProjectActor.send({
    type: 'UPDATE',
    updatedResources: [
      { _id: project._id, order: targetOrderInfo.order },
      { _id: targetOrderInfo._id, order: currentOrderInfo.order },
    ],
  });
};

const SwapUpControl: React.FC<SwapProjectOrderControlsProps> = ({ project, orderInfos, show }) => {
  const swapPositionUp = () => {
    _swapPosition(project, orderInfos, 'up');
  };

  return (
    <BaseControl onClick={swapPositionUp} icon={<AiOutlineCaretUp />} show={show}>Up</BaseControl>
  );
};

const SwapDownControl: React.FC<SwapProjectOrderControlsProps> = ({ project, orderInfos, show }) => {
  const swapPositionDown = () => {
    _swapPosition(project, orderInfos, 'down');
  };

  return (
    <BaseControl onClick={swapPositionDown} icon={<AiOutlineCaretDown />} show={show}>Down</BaseControl>
  );
};

const SwapTopControl: React.FC<SwapProjectOrderControlsProps> = ({ project, orderInfos, show }) => {
  const swapPositionTop = () => {
    _swapPosition(project, orderInfos, 'top');
  };

  return (
    <BaseControl onClick={swapPositionTop} icon={<BiSolidArrowToTop />} show={show}>Top</BaseControl>
  );
};

const SwapBottomControl: React.FC<SwapProjectOrderControlsProps> = ({ project, orderInfos, show }) => {
  const swapPositionBottom = () => {
    _swapPosition(project, orderInfos, 'bottom');
  };

  return (
    <BaseControl onClick={swapPositionBottom} icon={<BiSolidArrowToBottom />} show={show}>Bottom</BaseControl>
  );
};

export { SwapUpControl, SwapDownControl, SwapTopControl, SwapBottomControl };