<?php

namespace App\Filament\Resources\Books\Schemas;

use App\Models\Author;
use App\Models\Category;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class BookForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('author_id')
                    ->label('المؤلف')
                    ->options(fn () => Author::pluck('name', 'id'))
                    ->searchable()
                    ->required(),

                Select::make('category_id')
                    ->label('التصنيف')
                    ->options(fn () => Category::pluck('name', 'id'))
                    ->searchable()
                    ->required(),

                TextInput::make('title')->label('العنوان')->required(),
                TextInput::make('slug')->label('الرابط (slug)')->required(),

                Textarea::make('description')->label('الوصف')->required()->columnSpanFull(),

                FileUpload::make('cover')->label('الغلاف')->disk('public')->image(),

                Select::make('language')
                    ->label('اللغة')
                    ->options(['ar' => 'عربي', 'fr' => 'فرنسي', 'en' => 'إنجليزي'])
                    ->default('ar')
                    ->required(),

                TextInput::make('pages')->label('عدد الصفحات')->numeric(),
                TextInput::make('publication_year')->label('سنة النشر')->numeric(),
                TextInput::make('edition')->label('الطبعة'),
                TextInput::make('isbn')->label('ISBN'),
                TextInput::make('legal_deposit')->label('الإيداع القانوني'),

                Select::make('publication_type')
                    ->label('نوع الإصدار')
                    ->options(['house_edition' => 'إصدار الدار', 'author_submission' => 'نشر مؤلف'])
                    ->required(),

                TextInput::make('price_digital')->label('السعر الرقمي')->numeric(),
                TextInput::make('price_print')->label('سعر الطباعة')->numeric(),
                TextInput::make('price_2')->label('سعر نسختين')->numeric(),
                TextInput::make('price_3')->label('سعر 3 نسخ')->numeric(),
                TextInput::make('price_4')->label('سعر 4 نسخ')->numeric(),
                TextInput::make('sale_email')->label('بريد البيع')->email(),

                Select::make('status')
                    ->label('الحالة')
                    ->options(['pending' => 'قيد المراجعة', 'approved' => 'موافَق عليه', 'rejected' => 'مرفوض'])
                    ->default('pending')
                    ->required(),

                DateTimePicker::make('published_at')->label('تاريخ النشر'),
            ]);
    }
}