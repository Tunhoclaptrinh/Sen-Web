import React from 'react';
import { Form, Input, Button, Card, Row, Col, InputNumber, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined, PictureOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd';
import ImageUpload from '@/components/common/Upload/ImageUpload';
import { getImageUrl } from '@/utils/image.helper';

interface HiddenObjectEditorProps {
    form: FormInstance;
}

const HiddenObjectEditor: React.FC<HiddenObjectEditorProps> = ({ form }) => {
    // 1. Watch background image to render the visual editor
    const bgImage = Form.useWatch('background_image', form);
    const items = Form.useWatch('items', form);

    // 2. State for interaction
    const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
    const [isDrawing, setIsDrawing] = React.useState(false);
    const [startPos, setStartPos] = React.useState<{ x: number, y: number } | null>(null);
    const [currentRect, setCurrentRect] = React.useState<{ x: number, y: number, w: number, h: number } | null>(null);
    
    const imgRef = React.useRef<HTMLImageElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // 3. Mouse Handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if (selectedIndex === null || !imgRef.current) return;
        e.preventDefault();

        const rect = imgRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width * 100;
        const y = (e.clientY - rect.top) / rect.height * 100;

        setIsDrawing(true);
        setStartPos({ x, y });
        setCurrentRect({ x, y, w: 0, h: 0 });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDrawing || !startPos || !imgRef.current) return;
        e.preventDefault();

        const rect = imgRef.current.getBoundingClientRect();
        const currentX = (e.clientX - rect.left) / rect.width * 100;
        const currentY = (e.clientY - rect.top) / rect.height * 100;

        const x = Math.min(startPos.x, currentX);
        const y = Math.min(startPos.y, currentY);
        const w = Math.abs(currentX - startPos.x);
        const h = Math.abs(currentY - startPos.y);

        setCurrentRect({ x, y, w, h });
    };

    const handleMouseUp = () => {
        if (!isDrawing || !currentRect || selectedIndex === null) {
            setIsDrawing(false);
            setStartPos(null);
            setCurrentRect(null);
            return;
        }

        // 4. Update Form
        const items = form.getFieldValue('items') || [];
        const newItems = [...items];
        
        // Ensure item exists
        if (!newItems[selectedIndex]) {
             setIsDrawing(false);
             return;
        }

        // Ensure coordinates object exists
        if (!newItems[selectedIndex].coordinates) {
            newItems[selectedIndex].coordinates = {};
        }

        newItems[selectedIndex].coordinates = {
            x: Number(currentRect.x.toFixed(2)),
            y: Number(currentRect.y.toFixed(2)),
            width: Number(currentRect.w.toFixed(2)),
            height: Number(currentRect.h.toFixed(2))
        };

        form.setFieldsValue({ items: newItems });

        setIsDrawing(false);
        setStartPos(null);
        setCurrentRect(null);
    };


    return (
        <div>
             <Row gutter={16}>
                <Col span={8}>
                     <Form.Item name="required_items" label="Số lượng cần tìm">
                        <InputNumber min={1} style={{width: '100%'}} />
                    </Form.Item>
                </Col>
                <Col span={16}>
                     <Form.Item name="guide_text" label="Hướng dẫn">
                        <Input placeholder="Ví dụ: Tìm 3 vật phẩm của Chú Tễu..." />
                    </Form.Item>
                </Col>
            </Row>

            {/* VISUAL EDITOR */}
                <div style={{ marginBottom: 24, padding: 16, background: '#f0f0f0', borderRadius: 8 }}>
                    <div style={{ marginBottom: 8, fontWeight: 'bold' }}>
                        Visual Editor {selectedIndex !== null ? <span style={{color: '#1890ff'}}>(Đang chọn Vật phẩm #{selectedIndex + 1} - Hãy vẽ lên hình)</span> : <span style={{color: '#999'}}>(Chọn một vật phẩm bên dưới để vẽ vị trí)</span>}
                    </div>
                    {bgImage ? (
                        <div 
                            ref={containerRef}
                            style={{ position: 'relative', width: '100%', maxWidth: '800px', margin: '0 auto', userSelect: 'none' }}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            <img 
                                ref={imgRef}
                                src={getImageUrl(bgImage)} 
                                alt="Background" 
                                style={{ width: '100%', display: 'block', border: '1px solid #ddd', cursor: selectedIndex !== null ? 'crosshair' : 'default' }} 
                                draggable={false}
                            />
                            
                            {/* Render Existing Items */}
                            {items?.map((item: any, idx: number) => {
                                const coords = item?.coordinates;
                                if (!coords || typeof coords.x !== 'number') return null;
                                const isSelected = idx === selectedIndex;
                                
                                return (
                                    <div
                                        key={idx}
                                        style={{
                                            position: 'absolute',
                                            left: `${coords.x}%`,
                                            top: `${coords.y}%`,
                                            width: `${coords.width}%`,
                                            height: `${coords.height}%`,
                                            border: isSelected ? '2px solid #1890ff' : '2px dashed rgba(255, 0, 0, 0.7)',
                                            backgroundColor: isSelected ? 'rgba(24, 144, 255, 0.2)' : 'rgba(255, 0, 0, 0.1)',
                                            zIndex: 10,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: isSelected ? '#1890ff' : 'red',
                                            fontWeight: 'bold',
                                            textShadow: '0 0 2px white',
                                            pointerEvents: 'none' // Let clicks pass through to container for drawing overlapping
                                        }}
                                    >
                                        {idx + 1}
                                    </div>
                                );
                            })}
    
                            {/* Render Current Drawing Rect */}
                            {isDrawing && currentRect && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: `${currentRect.x}%`,
                                        top: `${currentRect.y}%`,
                                        width: `${currentRect.w}%`,
                                        height: `${currentRect.h}%`,
                                        border: '2px solid #1890ff',
                                        backgroundColor: 'rgba(24, 144, 255, 0.3)',
                                        zIndex: 20,
                                        pointerEvents: 'none'
                                    }}
                                />
                            )}
                        </div>
                    ) : (
                        <div style={{ 
                            height: 200, 
                            border: '2px dashed #ccc', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            flexDirection: 'column',
                            color: '#999'
                        }}>
                            <PictureOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                            <div>Chưa có ảnh nền. Hãy tải ảnh lên ở tab "Thông tin chung" để dùng Visual Editor.</div>
                        </div>
                    )}
                </div>


            <Divider orientation="left">Danh sách vật phẩm ẩn</Divider>

            <Form.List name="items">
                {(fields, { add, remove }) => (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {fields.map(({ key, name, ...restField }, index) => {
                             const isSelected = selectedIndex === index;
                             return (
                            <Card 
                                key={key} 
                                size="small" 
                                title={
                                    <div 
                                        onClick={() => setSelectedIndex(index)} 
                                        style={{ cursor: 'pointer', color: isSelected ? '#1890ff' : 'inherit' }}
                                    >
                                        Vật phẩm #{index + 1} {isSelected && "(Đang sửa)"}
                                    </div>
                                }
                                headStyle={{ backgroundColor: isSelected ? '#e6f7ff' : undefined }}
                                style={{ borderColor: isSelected ? '#1890ff' : undefined }}
                                extra={
                                    <Button 
                                        type="text" 
                                        danger 
                                        icon={<DeleteOutlined />} 
                                        onClick={() => {
                                            remove(name);
                                            if (selectedIndex === index) setSelectedIndex(null);
                                        }} 
                                    />
                                }
                            >
                                <Row gutter={16}>
                                    <Col span={24} style={{marginBottom: 12}}>
                                        <Button 
                                            type={isSelected ? "primary" : "default"} 
                                            onClick={() => setSelectedIndex(index)}
                                            style={{width: '100%'}}
                                        >
                                            {isSelected ? "Đang chọn: Vẽ lên hình để đặt vị trí" : "Chọn để đặt vị trí trên hình"}
                                        </Button>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'id']}
                                            label="ID Item"
                                            rules={[{ required: true }]}
                                        >
                                            <Input placeholder="item_fan" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'name']}
                                            label="Tên hiển thị"
                                            rules={[{ required: true }]}
                                        >
                                            <Input placeholder="Cái quạt" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'fact_popup']}
                                            label="Thông tin (Fact Popup)"
                                        >
                                            <Input.TextArea rows={2} placeholder="Thông tin hiện ra khi tìm thấy..." />
                                        </Form.Item>
                                    </Col>

                                    <Col span={24}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'image']}
                                            label="Hình ảnh vật phẩm (Hiện khi tìm thấy)"
                                        >
                                            <ImageUpload maxCount={1} />
                                        </Form.Item>
                                    </Col>
                                    
                                    <Col span={6}>
                                         <Form.Item {...restField} name={[name, 'coordinates', 'x']} label="X (%)">
                                            <InputNumber min={0} max={100} style={{width: '100%'}} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                         <Form.Item {...restField} name={[name, 'coordinates', 'y']} label="Y (%)">
                                            <InputNumber min={0} max={100} style={{width: '100%'}} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                         <Form.Item {...restField} name={[name, 'coordinates', 'width']} label="Width (%)">
                                            <InputNumber min={0} max={100} style={{width: '100%'}} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                         <Form.Item {...restField} name={[name, 'coordinates', 'height']} label="Height (%)">
                                            <InputNumber min={0} max={100} style={{width: '100%'}} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>
                        )})}
                        
                        <Button 
                            type="dashed" 
                            onClick={() => {
                                const screenId = form.getFieldValue('id') || 'ITEM';
                                add({ id: `${screenId}_I${fields.length + 1}` });
                            }} 
                            block 
                            icon={<PlusOutlined />}
                        >
                            Thêm vật phẩm
                        </Button>
                    </div>
                )}
            </Form.List>
        </div>
    );
};

export default HiddenObjectEditor;


