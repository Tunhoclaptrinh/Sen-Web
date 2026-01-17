import { useState, useMemo } from "react";
import { message } from "antd";
import { Level } from "@/types";
import adminLevelService from "@/services/admin-level.service";
import { useCRUD } from "@/hooks/useCRUD";

// Default screens based on level type
const getDefaultScreens = (type: string) => {
    switch (type) {
        case 'story':
            return [
                {
                    id: 'intro',
                    type: 'DIALOGUE',
                    content: [
                        { speaker: 'AI', text: 'Chào mừng bạn đến với màn chơi mới!' }
                    ],
                    next_screen_id: 'story'
                },
                {
                    id: 'story',
                    type: 'DIALOGUE',
                    content: [
                        { speaker: 'AI', text: 'Đây là nội dung câu chuyện...' }
                    ]
                }
            ];

        case 'quiz':
            return [
                {
                    id: 'intro',
                    type: 'DIALOGUE',
                    content: [
                        { speaker: 'AI', text: 'Hãy trả lời câu hỏi để hoàn thành màn chơi!' }
                    ],
                    next_screen_id: 'quiz1'
                },
                {
                    id: 'quiz1',
                    type: 'QUIZ',
                    question: 'Câu hỏi mẫu?',
                    options: [
                        { text: 'Đáp án A', is_correct: false },
                        { text: 'Đáp án B', is_correct: true },
                        { text: 'Đáp án C', is_correct: false },
                        { text: 'Đáp án D', is_correct: false }
                    ]
                }
            ];

        case 'hidden_object':
            return [
                {
                    id: 'intro',
                    type: 'DIALOGUE',
                    content: [
                        { speaker: 'AI', text: 'Hãy tìm các vật phẩm ẩn trong hình!' }
                    ],
                    next_screen_id: 'gameplay'
                },
                {
                    id: 'gameplay',
                    type: 'HIDDEN_OBJECT',
                    guide_text: 'Tìm các vật phẩm',
                    items: [
                        {
                            id: 'item1',
                            name: 'Vật phẩm mẫu',
                            coordinates: { x: 20, y: 30, width: 10, height: 10 },
                            fact_popup: 'Đây là mô tả về vật phẩm',
                            points: 10
                        }
                    ],
                    required_items: 1,
                    next_screen_id: 'completion'
                },
                {
                    id: 'completion',
                    type: 'DIALOGUE',
                    content: [
                        { speaker: 'AI', text: 'Chúc mừng! Bạn đã hoàn thành màn chơi!' }
                    ]
                }
            ];

        case 'timeline':
            return [
                {
                    id: 'intro',
                    type: 'DIALOGUE',
                    content: [
                        { speaker: 'AI', text: 'Hãy sắp xếp các sự kiện theo thời gian!' }
                    ],
                    next_screen_id: 'timeline'
                },
                {
                    id: 'timeline',
                    type: 'TIMELINE',
                    events: [
                        {
                            id: 'event1',
                            title: 'Sự kiện 1',
                            date: '1900',
                            description: 'Mô tả sự kiện'
                        }
                    ]
                }
            ];

        default:
            return [
                {
                    id: 'default',
                    type: 'DIALOGUE',
                    content: [
                        { speaker: 'AI', text: 'Màn chơi đang được phát triển...' }
                    ]
                }
            ];
    }
};

export const useLevelModel = () => {
    // UI State
    const [currentRecord, setCurrentRecord] = useState<Level | null>(null);
    const [formVisible, setFormVisible] = useState(false);

    // CRUD Setup
    const crudOptions = useMemo(() => ({
        pageSize: 10,
        autoFetch: true,
        onError: (action: string, error: any) => {
            console.error(`Error ${action} level:`, error);
            message.error(`Thao tác thất bại: ${error.message}`);
        },
    }), []);

    const crud = useCRUD(adminLevelService, crudOptions);

    // UI Handlers
    const openCreate = () => {
        setCurrentRecord(null);
        setFormVisible(true);
    };

    const openEdit = (record: Level) => {
        setCurrentRecord(record);
        setFormVisible(true);
    };

    const closeForm = () => {
        setFormVisible(false);
        setCurrentRecord(null);
    };

    const handleSubmit = async (values: any) => {
        let success = false;

        if (currentRecord) {
            // Update existing level
            success = await crud.update(currentRecord.id, values);
        } else {
            // Create new level - add default screens based on type
            const defaultScreens = getDefaultScreens(values.type);
            const createValues = {
                ...values,
                screens: defaultScreens
            };
            success = await crud.create(createValues);
        }

        if (success) {
            closeForm();
        }
        return success;
    };

    return {
        ...crud,
        currentRecord,
        formVisible,
        handleSubmit,
        deleteItem: crud.remove,
        batchDelete: crud.batchDelete,
        openCreate,
        openEdit,
        closeForm,
    };
};
