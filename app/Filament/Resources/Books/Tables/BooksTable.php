<?php

namespace App\Filament\Resources\Books\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class BooksTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('title')->label('العنوان')->searchable(),
                TextColumn::make('author.name')->label('المؤلف')->searchable(),
                TextColumn::make('category.name')->label('التصنيف')->searchable(),
                TextColumn::make('publication_type')->label('النوع')
                    ->formatStateUsing(fn ($state) => $state === 'house_edition' ? 'إصدار الدار' : 'نشر مؤلف'),
                BadgeColumn::make('status')
                    ->label('الحالة')
                    ->colors([
                        'warning' => 'pending',
                        'success' => 'approved',
                        'danger' => 'rejected',
                    ]),
                TextColumn::make('price_print')->label('سعر الطباعة')->numeric()->sortable(),
                TextColumn::make('price_digital')->label('السعر الرقمي')->numeric()->sortable(),
                TextColumn::make('downloads_count')->label('التنزيلات')->numeric()->sortable(),
                TextColumn::make('views_count')->label('المشاهدات')->numeric()->sortable(),
                TextColumn::make('published_at')->label('تاريخ النشر')->dateTime()->sortable(),
                TextColumn::make('created_at')->label('تاريخ الإضافة')->dateTime()->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->label('الحالة')
                    ->options(['pending' => 'قيد المراجعة', 'approved' => 'موافَق عليه', 'rejected' => 'مرفوض']),
                SelectFilter::make('publication_type')
                    ->label('النوع')
                    ->options(['house_edition' => 'إصدار الدار', 'author_submission' => 'نشر مؤلف']),
            ])
            ->recordActions([
                EditAction::make()->label('تعديل'),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make()->label('حذف'),
                ]),
            ]);
    }
}