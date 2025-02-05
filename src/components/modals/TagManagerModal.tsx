import React from 'react';
import Modal from '@/app/ui/Modal';
import { useSelector } from '@xstate/react';
import { ProjectActor } from '@/app/resources';
import { Col, Row } from '@/app/ui';
import { AppActor } from '@/app/machines/appMachine';
import { useTagsColors } from '@/hooks/useTagColors';

type TagManagerModalProps = object

const TagManagerModal: React.FC<TagManagerModalProps> = () => {
  const periodicTagManager = useSelector(AppActor, (state) => state.matches({ periodicProjectsPage: 'tagManager' }));

  const projects = useSelector(ProjectActor, ({ context }) => context.resources);
  const tags = [...new Set(projects.flatMap((project) => project.tags))].sort();

  const { tagsColors, setTagsColors } = useTagsColors();

  const closeModal = () => {
    AppActor.send({ type: 'CLOSE_TAG_MANAGER' });
  }

  const pastelColors = [
    '#FFB3BA', // Light Pink
    '#FFDFBA', // Light Orange
    '#FFFFBA', // Light Yellow
    '#BAFFC9', // Light Green
    '#BAE1FF', // Light Blue
    '#D4A5A5', // Pastel Red
    '#D4C4A5', // Pastel Brown
    '#D4D4A5', // Pastel Yellow-Green
    '#A5D4D4', // Pastel Cyan
    '#C4A5D4'  // Pastel Purple
  ];

  const setTagColor = (tag: string, color: string | undefined) => {
    setTagsColors((prev) => ({ ...prev, [tag]: color }));
  }

  return (
    <Modal
      width={'1000px'}
      visible={periodicTagManager}
      onClose={closeModal}
      footer={
        <Row gap={10} style={{ justifyContent: 'flex-end' }}>
          <button onClick={closeModal}>Cancel</button>
        </Row>
      }
    >
      <Col gap={10}>
        {tags.map((tag) => (
          <Row key={tag} gap={10} centerY>
            <label>{tag}:</label>
            {/* <input type="color" /> */}
            <Row gap={10} centerY style={{ flex: '2', justifyContent: 'flex-end' }}>
              <div
                onClick={() => setTagColor(tag, undefined)}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  border: tagsColors[tag] === undefined ? '3px solid white' : '1px solid white',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>x</div>
              {pastelColors.map((color, index) => (
                <div
                  key={index}
                  onClick={() => setTagColor(tag, color)}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    cursor: 'pointer',
                    border: tagsColors[tag] === color ? '1px solid black' : 'none',
                    boxShadow: tagsColors[tag] === color ? '0 0 0 2px white' : 'none',
                  }}
                />
              ))}
            </Row>
            <Row centerY style={{ flex: 'none', width: '30%' }} />
          </Row>
        ))}
      </Col>
    </Modal>
  );
};

export default TagManagerModal;